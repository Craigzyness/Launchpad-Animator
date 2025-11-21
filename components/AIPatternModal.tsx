
import React, { useState } from 'react';
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Frame } from '../App';
import { GRID_NOTES, COLOR_PALETTE, OFF_COLOR } from '../constants';
import { createBlankLayer } from '../utils/colorUtils';

interface AIPatternModalProps {
  onClose: () => void;
  onGenerate: (frames: Frame[]) => void;
}

const COLOR_GUIDE = COLOR_PALETTE.map(c => `${c.name}: ${c.code}`).join(', ');

export const AIPatternModal: React.FC<AIPatternModalProps> = ({ onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      // Initialize Gemini client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Define schema for structured JSON output
      const schema: Schema = {
        type: Type.OBJECT,
        properties: {
          frames: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                duration: { type: Type.INTEGER, description: "Duration of the frame in milliseconds (default 125)" },
                grid: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER },
                    description: "A row of 8 color codes representing the 8x8 grid."
                  },
                  description: "The 8x8 grid of color codes. Rows from top to bottom."
                }
              },
              required: ["duration", "grid"]
            }
          }
        },
        required: ["frames"]
      };

      const systemInstruction = `You are an expert lighting designer for the Novation Launchpad MK2, creating animations for an 8x8 LED grid.
      
      Your goal is to generate creative, colorful, and rhythmic light shows based on the user's description.
      
      The grid is 8x8. Row 0 is top, Row 7 is bottom. Column 0 is left, Column 7 is right.
      
      Use the following color codes:
      ${COLOR_GUIDE}
      Use 0 for OFF (black).
      
      Return a JSON object containing an array of frames.
      Each frame has a 'duration' (ms) and a 'grid' (8x8 array of numbers).
      Make the animation smooth and interesting.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 1.2, // High creativity
        },
        contents: `Create a light pattern: ${prompt}`,
      });

      const text = response.text;
      if (!text) throw new Error("No response received from AI.");

      const data = JSON.parse(text);
      
      if (!data.frames || !Array.isArray(data.frames) || data.frames.length === 0) {
        throw new Error("AI returned invalid data.");
      }

      const newFrames: Frame[] = data.frames.map((f: any) => {
        const layer = createBlankLayer();
        // Map the 8x8 grid array to the Launchpad MIDI note map
        if (Array.isArray(f.grid)) {
            f.grid.forEach((row: any, y: number) => {
                if (Array.isArray(row)) {
                    row.forEach((color: any, x: number) => {
                        if (y >= 0 && y < 8 && x >= 0 && x < 8) {
                            const note = GRID_NOTES[y][x];
                            if (note) {
                                // Ensure color is a valid number, default to OFF
                                layer[note] = typeof color === 'number' ? color : OFF_COLOR;
                            }
                        }
                    });
                }
            });
        }
        
        return {
            layer,
            duration: typeof f.duration === 'number' ? Math.max(50, f.duration) : 125
        };
      });

      onGenerate(newFrames);
      onClose();

    } catch (err: any) {
      console.error("AI Generation Error:", err);
      setError(err.message || "Failed to generate pattern.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="ai-modal-title">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-gray-700 flex flex-col gap-4">
        <div className="flex justify-between items-center">
            <h2 id="ai-modal-title" className="text-xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 9a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-1a1 1 0 100 2 1 1 0 000-2zm-8 1a1 1 0 110 2 1 1 0 010-2zm12.293-4.293a1 1 0 011.414 1.414L10 16.414l-4.293-4.293a1 1 0 011.414-1.414L10 13.586l5.293-5.293z" clipRule="evenodd" />
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.234 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z"/>
            </svg>
            AI Pattern Generator
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <div className="space-y-1">
            <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-300">Describe your animation</label>
            <textarea
                id="ai-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A burning fire effect that flickers, or a matrix rain effect with green drops."
                className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[100px] resize-none"
                disabled={isLoading}
            />
        </div>

        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md text-sm flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
            </div>
        )}

        <div className="mt-4 flex justify-end gap-3">
            <button 
                onClick={onClose} 
                className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
                disabled={isLoading}
            >
                Cancel
            </button>
            <button 
                onClick={handleGenerate} 
                className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
                disabled={isLoading || !prompt.trim()}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Thinking...
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 9a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-1a1 1 0 100 2 1 1 0 000-2zm-8 1a1 1 0 110 2 1 1 0 010-2zm12.293-4.293a1 1 0 011.414 1.414L10 16.414l-4.293-4.293a1 1 0 011.414-1.414L10 13.586l5.293-5.293z" clipRule="evenodd" />
                        </svg>
                        Generate
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};
