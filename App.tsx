

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { LaunchpadGrid } from './components/LaunchpadGrid';
import { AnimationControls } from './components/AnimationControls';
import { FrameStrip } from './components/FrameStrip';
import { EditingPanel } from './components/EditingPanel';
import { DeviceSelectionModal } from './components/DeviceSelectionModal';
import { GifExportModal } from './components/GifExportModal';
import { MarqueeTextModal } from './components/MarqueeTextModal';
import { TypingTextModal } from './components/TypingTextModal';
import { PresetLibraryModal } from './components/PresetLibraryModal';
import { TransformModal } from './components/TransformModal';
import { TransitionModal } from './components/TransitionModal';
import { SaveLoadControls } from './components/SaveLoadControls';
import { ConfirmationModal, ConfirmationState } from './components/ConfirmationModal';
import { AIPatternModal } from './components/AIPatternModal';
import { ToastContainer, useToast } from './components/Toast';
import * as midiService from './services/midiService';
import { LAUNCHPAD_COLOR_MAP_HEX, OFF_COLOR, COLOR_PALETTE, DEFAULT_FRAME_DURATION, INITIAL_FPS } from './constants';
import { useInterval } from './hooks/useInterval';
import { useHistory } from './hooks/useHistory';
import { createBlankLayer, findClosestColorCode } from './utils/colorUtils';
import { performToolAction, isShapeTool, isContinuousTool, transformFrame } from './services/drawingService';
import { exportToGif } from './services/gifExporter';
import { generateMarqueeFrames, renderTypingTextToFrames } from './utils/font';
import { ANIMATION_PRESETS, INTERACTIVE_PRESETS } from './patterns';
import { generateInteractiveEffectFrames } from './services/interactiveEffects';
import { createTransitionFrames } from './utils/easing';
import saveAs from 'file-saver';


// --- TYPE DEFINITIONS ---
export type Tool = 'draw' | 'erase' | 'fill' | 'eyedropper' | 'line' | 'rect' | 'rect_outline' | 'circle' | 'select' | 'colorCycle' | 'gradient';
export type Symmetry = 'none' | 'vertical' | 'horizontal';
export type Layer = Record<number, number>; // note -> colorCode
export interface Frame {
  layer: Layer;
  duration: number; // in ms
}
export interface AnimationPreset {
    type: 'animation';
    name: string;
    category: string;
    colors: readonly number[];
    generator: (colors: readonly number[]) => Layer[];
}
export interface InteractivePreset {
    type: 'interactive';
    name: string;
    category: string;
    effect: 'ripple' | 'trail' | 'fireworks' | 'paintSplash' | 'chaser' | 'randomLights' | 'strobe' | 'crosshair' | 'colorBurst' | 'invert' | 'glitch' | 'pulse';
    colors: readonly number[];
    settings?: {
        speed?: number;
        size?: number;
    };
}
export type EasingFunction = 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad';
export interface ProjectState {
  frames: Frame[];
  palette: { name: string; code: number }[];
  fps: number;
  projectName: string;
}


const createInitialFrame = (): Frame => ({
  layer: createBlankLayer(),
  duration: DEFAULT_FRAME_DURATION,
});

export const App: React.FC = () => {
  // Project State
  const [projectName, setProjectName] = useState('My Launchpad Project');
  
  // Animation State
  const [frames, setFrames] = useState<Frame[]>([createInitialFrame()]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(INITIAL_FPS);
  const [onionSkinEnabled, setOnionSkinEnabled] = useState(true);

  // Drawing State
  const [padColors, setPadColors] = useState<Record<number, number>>({}); // Base colors of the current frame
  const [effectOverlay, setEffectOverlay] = useState<Layer>({}); // Temporary overlay for interactive effects
  const [activeTool, setActiveTool] = useState<Tool>('draw');
  const previousToolRef = useRef<Tool>('draw');
  const [selectedColor, setSelectedColor] = useState(5);
  const [palette, setPalette] = useState(COLOR_PALETTE);
  const [symmetry, setSymmetry] = useState<Symmetry>('none');
  const drawingState = useRef({ isDrawing: false, startNote: null as number | null, lastNote: null as number | null });
  const [copiedFrameContent, setCopiedFrameContent] = useState<Layer | null>(null);

  // MIDI & Device State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<midiService.LaunchpadDevice[]>([]);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [lastMidiNote, setLastMidiNote] = useState<number | null>(null);

  // Modal & UI State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isMarqueeModalOpen, setIsMarqueeModalOpen] = useState(false);
  const [isTypingModalOpen, setIsTypingModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isPresetLibraryOpen, setIsPresetLibraryOpen] = useState<{ open: boolean; type: 'animation' | 'effect' }>({ open: false, type: 'animation' });
  const [isTransformModalOpen, setIsTransformModalOpen] = useState(false);
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);
  const [transitionTargetFrame, setTransitionTargetFrame] = useState(0);
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({ isOpen: false });
  const { toasts, addToast, removeToast } = useToast();
  
  // Preset & Effect State
  const [activePreset, setActivePreset] = useState<AnimationPreset | null>(null);
  const [editableEffect, setEditableEffect] = useState<InteractivePreset | null>(null);
  const padColorsRef = useRef(padColors);
  const editableEffectRef = useRef(editableEffect);
  const isEffectPlayingRef = useRef(false);

  // --- INTERACTION QUEUE ---
  const [interactionQueue, setInteractionQueue] = useState<number[]>([]);


  // Undo/Redo State
  const { 
      push: pushHistory, 
      undo: undoHistory, 
      redo: redoHistory, 
      canUndo, 
      canRedo, 
      reset: resetHistory 
  } = useHistory<Frame[]>(frames);

  const currentFrame = frames[currentFrameIndex];

  // --- HISTORY MANAGEMENT ---
  const commitToHistory = (newFrames: Frame[]) => {
      pushHistory(newFrames);
  };
  
  const handleUndo = useCallback(() => {
      const previousState = undoHistory();
      if (previousState) {
          setFrames(previousState);
          if(currentFrameIndex >= previousState.length) {
              setCurrentFrameIndex(previousState.length - 1);
          }
      }
  }, [undoHistory, currentFrameIndex]);

  const handleRedo = useCallback(() => {
      const nextState = redoHistory();
      if (nextState) {
          setFrames(nextState);
      }
  }, [redoHistory]);


  // --- DERIVED STATE & RENDERING ---
  const displayedPadColors = useMemo(() => {
    const merged = { ...padColors };
    for (const note in effectOverlay) {
        if (effectOverlay[note] !== OFF_COLOR) {
            merged[note] = effectOverlay[note];
        }
    }
    return merged;
  }, [padColors, effectOverlay]);

  const updateBasePadColors = useCallback(() => {
    const frame = frames[currentFrameIndex];
    if (!frame) return;
    setPadColors(frame.layer);
  }, [frames, currentFrameIndex]);

  useEffect(() => {
    updateBasePadColors();
  }, [updateBasePadColors]);

  // Keep refs updated with the latest state to be used in stable callbacks/effects
  useEffect(() => {
      padColorsRef.current = padColors;
  }, [padColors]);
  
  useEffect(() => {
      editableEffectRef.current = editableEffect;
  }, [editableEffect]);

  // Main lighting effect: declarative, handles all standard rendering.
  useEffect(() => {
    if (isEffectPlayingRef.current) return;
    if (midiService.isConnected()) {
      midiService.lightFrame(displayedPadColors);
    }
  }, [displayedPadColors, isConnected]);

  
  // --- RE-ARCHITECTED INTERACTION & MIDI HANDLING ---
  
  useEffect(() => {
    if (interactionQueue.length === 0) {
      return;
    }

    const currentEffect = editableEffectRef.current;
    
    if (!currentEffect || isEffectPlayingRef.current) {
      setInteractionQueue(q => q.slice(1));
      return;
    }

    const noteToProcess = interactionQueue[0];
    setInteractionQueue(q => q.slice(1));

    const effectFrames = generateInteractiveEffectFrames(
      currentEffect.effect,
      noteToProcess,
      currentEffect.colors,
      currentEffect.settings || {},
      padColorsRef.current
    );

    if (effectFrames.length > 0) {
      isEffectPlayingRef.current = true;

      const playEffectLoop = async () => {
          // This delay is the definitive fix. It provides a robust, generous
          // window for the browser's MIDI driver to finish processing the
          // input signal before we try to send an output signal, thus
          // resolving the race condition that was dropping hardware updates.
          await new Promise(resolve => setTimeout(resolve, 10));

          for (const effectFrame of effectFrames) {
              setEffectOverlay(effectFrame);
              
              if (midiService.isConnected()) {
                  const mergedForHardware = { ...padColorsRef.current, ...effectFrame };
                  midiService.lightFrame(mergedForHardware);
              }

              await new Promise(resolve => setTimeout(resolve, 50));
          }

          setEffectOverlay({});
          isEffectPlayingRef.current = false;
          if (midiService.isConnected()) {
              midiService.lightFrame(padColorsRef.current);
          }
      };
      
      playEffectLoop();
    }
  }, [interactionQueue]);


  // The MIDI message handler is now stable and simply adds interactions to the queue.
  const handleMidiMessage = useCallback((data: Uint8Array) => {
    const [status, note, velocity] = data;
    const command = status & 0xF0;
    
    if (command === 144 && velocity > 0) {
      setLastMidiNote(note);
      setInteractionQueue(q => [...q, note]);
    } else {
       setLastMidiNote(null);
    }
  }, []); // Empty dependency array ensures this function is stable
  
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const devices = await midiService.getAvailableLaunchpads();
      if (devices.length === 0) {
        addToast("No Launchpad MK2 devices found. Please ensure it's connected and your browser has MIDI permissions.", 'error');
      } else if (devices.length === 1) {
        await connectToDevice(devices[0].id);
      } else {
        setAvailableDevices(devices);
        setIsDeviceModalOpen(true);
      }
    } catch (error: any) {
      console.error("Failed to get MIDI devices:", error);
      addToast(`Could not access MIDI devices: ${error.message}`, 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const connectToDevice = async (id: string) => {
    setIsConnecting(true);
    try {
        const success = await midiService.connect(id, handleMidiMessage);
        if (success) {
          setIsConnected(true);
          addToast("Connected to Launchpad MK2", 'success');
          
          setTimeout(() => {
            if (!midiService.isConnected()) return;
            
            const CORNER_COLOR = 29;
            midiService.lightPad(81, CORNER_COLOR);
            midiService.lightPad(88, CORNER_COLOR);
            midiService.lightPad(11, CORNER_COLOR);
            midiService.lightPad(18, CORNER_COLOR);
            
            setTimeout(() => {
              if (midiService.isConnected()) {
                  midiService.lightFrame(displayedPadColors);
              }
            }, 250);
          }, 100);

        } else {
          addToast("Failed to connect to the Launchpad device. It might be in use by another application.", 'error');
        }
    } catch (error: any) {
        console.error("Error connecting to Launchpad:", error);
        addToast(`Connection error: ${error.message}`, 'error');
    }
    setIsDeviceModalOpen(false);
    setIsConnecting(false);
  };
  
  const handleDisconnect = async () => {
    await midiService.disconnect();
    setIsConnected(false);
    addToast("Disconnected from Launchpad", 'info');
  };
  
    // --- KEYBOARD SHORTCUTS ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeEl = document.activeElement;
            if (activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA' || confirmationState.isOpen) return;

            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 'z': e.preventDefault(); handleUndo(); break;
                    case 'y': e.preventDefault(); handleRedo(); break;
                    case 'c': e.preventDefault(); handleCopyFrameContent(); break;
                    case 'v': e.preventDefault(); handlePasteFrameContent(); break;
                    case 'arrowleft':
                        e.preventDefault();
                        handleMoveFrame(currentFrameIndex, Math.max(0, currentFrameIndex - 1));
                        break;
                    case 'arrowright':
                        e.preventDefault();
                        handleMoveFrame(currentFrameIndex, Math.min(frames.length - 1, currentFrameIndex + 1));
                        break;
                }
                return;
            }

            if (isMarqueeModalOpen || isTypingModalOpen || isPresetLibraryOpen.open || isDeviceModalOpen || isTransformModalOpen || isTransitionModalOpen || isAIModalOpen) return;

            switch(e.key.toLowerCase()) {
                case 'p': setActiveTool('draw'); break;
                case 'e': setActiveTool('erase'); break;
                case 'g': setActiveTool('fill'); break;
                case 'i': setActiveTool('eyedropper'); break;
                case 'l': setActiveTool('line'); break;
                case ' ': e.preventDefault(); handleTogglePlay(); break;
                case 'arrowright': e.preventDefault(); setCurrentFrameIndex(i => Math.min(frames.length - 1, i + 1)); break;
                case 'arrowleft': e.preventDefault(); setCurrentFrameIndex(i => Math.max(0, i - 1)); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo, isPlaying, frames, currentFrameIndex, isMarqueeModalOpen, isTypingModalOpen, isPresetLibraryOpen, isDeviceModalOpen, isTransformModalOpen, isTransitionModalOpen, isAIModalOpen, confirmationState.isOpen]);


  // --- ANIMATION HANDLING ---
  const handleTogglePlay = () => setIsPlaying(!isPlaying);
  
  const handleFpsChange = (newFps: number) => {
    setFps(newFps);
    const newDuration = 1000 / newFps;
    // Update all frames to match the new global FPS
    const newFrames = frames.map(frame => ({
      ...frame,
      duration: newDuration,
    }));
    setFrames(newFrames);
  };
  
  useInterval(() => {
      const currentFrameDuration = frames[currentFrameIndex]?.duration || 1000 / fps;
      const effectiveDelay = isPlaying ? currentFrameDuration : null;

      if (effectiveDelay) {
        setCurrentFrameIndex(prev => (prev + 1) % frames.length);
      }
  }, isPlaying ? frames[currentFrameIndex]?.duration : null);


  const handleAddFrame = () => {
    const newFrame = createInitialFrame();
    const newIndex = currentFrameIndex + 1;
    const newFrames = [...frames.slice(0, newIndex), newFrame, ...frames.slice(newIndex)];
    setFrames(newFrames);
    commitToHistory(newFrames);
    setCurrentFrameIndex(newIndex);
  };

  const handleDuplicateFrame = () => {
    const frameToCopy = JSON.parse(JSON.stringify(currentFrame));
    const newIndex = currentFrameIndex + 1;
    const newFrames = [...frames.slice(0, newIndex), frameToCopy, ...frames.slice(newIndex)];
    setFrames(newFrames);
    commitToHistory(newFrames);
    setCurrentFrameIndex(newIndex);
  };

  const handleDeleteFrame = () => {
    if (frames.length <= 1) return;
    const newFrames = frames.filter((_, i) => i !== currentFrameIndex);
    const newIndex = Math.min(currentFrameIndex, newFrames.length - 1);
    setFrames(newFrames);
    commitToHistory(newFrames);
    setCurrentFrameIndex(newIndex);
  };

  const handleClearFrame = () => {
    updateFrame(currentFrameIndex, {
      ...currentFrame,
      layer: createBlankLayer(),
    });
  };
  
  const handleClearAll = () => {
    setConfirmationState({
      isOpen: true,
      title: "Clear Project",
      message: "Are you sure you want to clear the entire project? This will reset all frames.",
      onConfirm: () => {
        const newFrames = [createInitialFrame()];
        setFrames(newFrames);
        setCurrentFrameIndex(0);
        setActivePreset(null);
        setEditableEffect(null);
        resetHistory(newFrames);
        setConfirmationState({ isOpen: false });
        addToast("Project cleared", 'info');
      },
      onCancel: () => setConfirmationState({ isOpen: false }),
    });
  };

  const handleClearAnimation = () => {
     setConfirmationState({
      isOpen: true,
      title: "Clear All Frames",
      message: "Are you sure you want to clear the content of all frames? The number of frames and their durations will be preserved.",
      onConfirm: () => {
        const clearedFrames = frames.map(frame => ({
          duration: frame.duration,
          layer: createBlankLayer(),
        }));
        setFrames(clearedFrames);
        commitToHistory(clearedFrames);
        setConfirmationState({ isOpen: false });
        addToast("All frames cleared", 'info');
      },
      onCancel: () => setConfirmationState({ isOpen: false }),
    });
  };

  const handleSelectFrame = (index: number) => setCurrentFrameIndex(index);
  
  const handleMoveFrame = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newFrames = [...frames];
    const [movedFrame] = newFrames.splice(fromIndex, 1);
    newFrames.splice(toIndex, 0, movedFrame);
    setFrames(newFrames);
    commitToHistory(newFrames);
    setCurrentFrameIndex(toIndex);
  };
  
  const updateFrame = (index: number, newFrame: Frame, commit: boolean = true) => {
    const newFrames = frames.map((frame, i) => i === index ? newFrame : frame);
    setFrames(newFrames);
    if(commit) commitToHistory(newFrames);
  };

  const handleFrameDurationChange = (index: number, duration: number) => {
    const newDuration = Math.max(20, duration); // 50fps max
    const newFrame = { ...frames[index], duration: newDuration };
    updateFrame(index, newFrame);
  };
  
  // --- DRAWING LOGIC ---
  const doToolAction = (note: number, isContinuous: boolean, isMouseUp: boolean = false) => {
    if (activeTool === 'eyedropper') {
        setSelectedColor(displayedPadColors[note] || OFF_COLOR);
        setActiveTool(previousToolRef.current);
        return;
    }
    
    const startNote = isContinuous ? drawingState.current.lastNote : drawingState.current.startNote;
    const result = performToolAction({ tool: activeTool, note, layer: currentFrame.layer, color: selectedColor, symmetry, startNote, palette });

    if (result) {
      const newFrame = { ...currentFrame, layer: result };
      const commit = isShapeTool(activeTool) ? isMouseUp : true;
      updateFrame(currentFrameIndex, newFrame, commit);
    }
    drawingState.current.lastNote = note;
  };

  const handlePadMouseDown = (note: number, e: React.MouseEvent) => {
    if (editableEffect) {
      setInteractionQueue(q => [...q, note]);
      return;
    }
    
    if (activePreset) {
      setActivePreset(null);
    }
    
    drawingState.current.isDrawing = true;
    drawingState.current.startNote = note;
    
    doToolAction(note, false);
  };

  const handlePadMouseOver = (note: number) => {
    if (drawingState.current.isDrawing && isContinuousTool(activeTool)) {
      doToolAction(note, true);
    }
  };
  
  const handleMouseUp = (e: MouseEvent) => {
    if (drawingState.current.isDrawing && drawingState.current.startNote && isShapeTool(activeTool)) {
        const endNote = midiService.getNoteFromMouse(e.clientX, e.clientY) || drawingState.current.lastNote;
        if(endNote) {
            doToolAction(endNote, false, true);
        }
    }
    drawingState.current.isDrawing = false;
    drawingState.current.startNote = null;
    drawingState.current.lastNote = null;
  };
  
  const handleCopyFrameContent = () => {
    setCopiedFrameContent(currentFrame.layer);
    addToast("Frame copied to clipboard", 'info');
  };

  const handlePasteFrameContent = () => {
    if (!copiedFrameContent) return;
    updateFrame(currentFrameIndex, { ...currentFrame, layer: { ...copiedFrameContent } });
    addToast("Frame pasted", 'info');
  };
  
  const handleToolChange = (tool: Tool) => {
    if (tool !== 'eyedropper') {
      previousToolRef.current = activeTool;
      setEditableEffect(null);
    }
    setActiveTool(tool);
  };


  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [activeTool, currentFrame, selectedColor, symmetry]);


  // --- GENERATORS & MODALS ---
  const handleExportGif = () => {
    setIsExporting(true);
    setExportProgress(0);
    const frameLayers = frames.map(frame => frame.layer);
    exportToGif(frameLayers, frames.map(f => f.duration), LAUNCHPAD_COLOR_MAP_HEX, setExportProgress)
      .finally(() => {
          setIsExporting(false);
          addToast("GIF Export Complete", 'success');
      });
  };
  
  const handleGenerateMarquee = (text: string, color: number, speed: number) => {
      setActivePreset(null);
      setEditableEffect(null);

      const generatedLayers = generateMarqueeFrames(text, color);
      const newFrames: Frame[] = generatedLayers.map((layer): Frame => ({
          layer: layer,
          duration: 1000 / speed,
      }));
      if (newFrames.length > 0) {
        setFrames(newFrames);
        commitToHistory(newFrames);
        setCurrentFrameIndex(0);
        setFps(speed);
        addToast("Marquee text generated", 'success');
      }
      setIsMarqueeModalOpen(false);
  };

  const handleGenerateTyping = (text: string, color: number, speed: number) => {
      setActivePreset(null);
      setEditableEffect(null);
      
      const newFrames = renderTypingTextToFrames(text, color, speed);
      if (newFrames.length > 0) {
        setFrames(newFrames);
        commitToHistory(newFrames);
        setCurrentFrameIndex(0);
        setFps(Math.round(1000 / newFrames[0].duration));
        addToast("Typing text generated", 'success');
      }
      setIsTypingModalOpen(false);
  };

  const handleAIGenerate = (newFrames: Frame[]) => {
    if (newFrames.length > 0) {
        setFrames(newFrames);
        commitToHistory(newFrames);
        setCurrentFrameIndex(0);
        // Reset state
        setActivePreset(null);
        setEditableEffect(null);
        setIsAIModalOpen(false);
        addToast("AI Pattern generated", 'success');
    }
  };
  
  const handlePresetSelect = (preset: AnimationPreset | InteractivePreset) => {
      if (preset.type === 'animation') {
          setActivePreset(preset);
          setEditableEffect(null);
          const generatedLayers = preset.generator(preset.colors);
          const newFrames: Frame[] = generatedLayers.map((layer): Frame => ({
              layer: layer,
              duration: DEFAULT_FRAME_DURATION,
          }));
          if (newFrames.length > 0) {
              setFrames(newFrames);
              commitToHistory(newFrames);
              setCurrentFrameIndex(0);
              setFps(INITIAL_FPS); // Reset FPS for new animation
          }
      } else {
        setActivePreset(null);
        setEditableEffect(JSON.parse(JSON.stringify(preset)));
      }
      setIsPresetLibraryOpen({ open: false, type: 'animation' });
  };
  
    const handleActivePresetColorsChange = (newColors: number[]) => {
        if (!activePreset) return;

        const updatedPreset = { ...activePreset, colors: newColors };
        setActivePreset(updatedPreset);

        const generatedLayers = updatedPreset.generator(newColors);
        const newFrames: Frame[] = generatedLayers.map((layer): Frame => ({
            layer: layer,
            duration: 1000 / fps, // Use current FPS to maintain speed during tweaks
        }));

        if (newFrames.length > 0) {
            setFrames(newFrames);
            commitToHistory(newFrames);
            setCurrentFrameIndex(0);
        }
    };
  
  const handleTransform = (type: import('./services/drawingService').TransformType) => {
    const newLayer = transformFrame(currentFrame.layer, type);
    updateFrame(currentFrameIndex, { ...currentFrame, layer: newLayer });
    setIsTransformModalOpen(false);
  };

  const handleCreateTransition = (numFrames: number, easing: EasingFunction) => {
    const fromFrame = frames[transitionTargetFrame - 1];
    const toFrame = frames[transitionTargetFrame];
    if (!fromFrame || !toFrame) return;

    const transition = createTransitionFrames(
      fromFrame.layer,
      toFrame.layer,
      numFrames,
      easing
    );

    const newFrames: Frame[] = transition.map((layer): Frame => ({
      layer: layer,
      duration: fromFrame.duration,
    }));
    
    const allFrames = [...frames];
    allFrames.splice(transitionTargetFrame, 0, ...newFrames);
    
    setFrames(allFrames);
    commitToHistory(allFrames);
    setIsTransitionModalOpen(false);
    addToast("Transition frames generated", 'success');
  };
  
  const handleAddCustomColor = (hex: string) => {
    const code = findClosestColorCode(hex);
    if (code > 0 && !palette.some(c => c.code === code)) {
        setPalette(p => [...p, {name: 'Custom', code}]);
        setSelectedColor(code);
    }
  };
  
  const handleRemoveColor = (codeToRemove: number) => {
      setPalette(p => p.filter(c => c.code !== codeToRemove));
      if (selectedColor === codeToRemove) {
          setSelectedColor(COLOR_PALETTE[0].code);
      }
  };
  
  // --- SAVE / LOAD ---
  const handleSaveProject = () => {
    const projectState: ProjectState = {
        frames,
        palette,
        fps,
        projectName
    };
    const blob = new Blob([JSON.stringify(projectState, null, 2)], { type: "application/json;charset=utf-8" });
    saveAs(blob, `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`);
    addToast("Project saved", 'success');
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const projectState: ProjectState = JSON.parse(event.target?.result as string);
                setFrames(projectState.frames);
                setPalette(projectState.palette);
                setFps(projectState.fps);
                setProjectName(projectState.projectName || 'Loaded Project');
                setCurrentFrameIndex(0);
                resetHistory(projectState.frames);
                addToast("Project loaded successfully", 'success');
            } catch (err) {
                addToast("Error: Could not parse project file.", 'error');
                console.error(err);
            }
        };
        reader.readAsText(file);
    }
  };

  const onionSkinFrame = onionSkinEnabled && !isPlaying && currentFrameIndex > 0 
    ? frames[currentFrameIndex - 1].layer
    : null;

  return (
    <div className="bg-gray-800 text-white min-h-screen flex flex-col items-center p-4 font-sans">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-4">
        <SaveLoadControls
          isConnected={isConnected}
          isConnecting={isConnecting}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onSave={handleSaveProject}
          onLoad={handleLoadProject}
          onExportGif={handleExportGif}
          projectName={projectName}
          onProjectNameChange={setProjectName}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 flex flex-col items-center justify-center gap-4">
            <LaunchpadGrid
              padColors={displayedPadColors}
              onPadMouseDown={handlePadMouseDown}
              onPadMouseOver={handlePadMouseOver}
              colorMap={LAUNCHPAD_COLOR_MAP_HEX}
              onionSkinFrame={onionSkinFrame}
              lastMidiNote={lastMidiNote}
              isEffectArmed={!!editableEffect}
            />
          </div>
          <div className="lg:col-span-1 h-full">
             <EditingPanel
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
                onAddCustomColor={handleAddCustomColor}
                onRemoveColor={handleRemoveColor}
                palette={palette}
                colorMap={LAUNCHPAD_COLOR_MAP_HEX}
                activeTool={activeTool}
                onToolChange={handleToolChange}
                onTextTool={() => setIsMarqueeModalOpen(true)}
                onTypingTool={() => setIsTypingModalOpen(true)}
                onAITool={() => setIsAIModalOpen(true)}
                symmetry={symmetry}
                onSymmetryChange={setSymmetry}
                onAnimationsClick={() => setIsPresetLibraryOpen({ open: true, type: 'animation' })}
                onEffectsClick={() => setIsPresetLibraryOpen({ open: true, type: 'effect' })}
                activePreset={activePreset}
                onActivePresetColorsChange={handleActivePresetColorsChange}
                editableEffect={editableEffect}
                onEditableEffectChange={setEditableEffect}
                onCopyFrameContent={handleCopyFrameContent}
                onPasteFrameContent={handlePasteFrameContent}
                onClearFrame={handleClearFrame}
             />
          </div>
        </div>
        <AnimationControls
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          fps={fps}
          onFpsChange={handleFpsChange}
          onAddFrame={handleAddFrame}
          onDeleteFrame={handleDeleteFrame}
          onDuplicateFrame={handleDuplicateFrame}
          onClearFrame={handleClearFrame}
          onClearAnimation={handleClearAnimation}
          onClearAll={handleClearAll}
          frameCount={frames.length}
          currentFrameIndex={currentFrameIndex}
          onionSkinEnabled={onionSkinEnabled}
          onToggleOnionSkin={() => setOnionSkinEnabled(!onionSkinEnabled)}
          onTransformClick={() => setIsTransformModalOpen(true)}
          onUndo={handleUndo}
          canUndo={canUndo}
          onRedo={handleRedo}
          canRedo={canRedo}
        />
        <FrameStrip
          frames={frames}
          currentFrameIndex={currentFrameIndex}
          onSelectFrame={handleSelectFrame}
          colorMap={LAUNCHPAD_COLOR_MAP_HEX}
          disabled={isPlaying}
          onMoveFrame={handleMoveFrame}
          onDurationChange={handleFrameDurationChange}
          onRightClick={(index) => {
              if (index > 0) {
                setTransitionTargetFrame(index);
                setIsTransitionModalOpen(true);
              }
          }}
        />
      </div>
      
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <ConfirmationModal {...confirmationState} />
      {isDeviceModalOpen && <DeviceSelectionModal devices={availableDevices} onSelect={connectToDevice} onCancel={() => setIsDeviceModalOpen(false)} />}
      {isExporting && <GifExportModal progress={exportProgress} />}
      {isMarqueeModalOpen && <MarqueeTextModal onClose={() => setIsMarqueeModalOpen(false)} onGenerate={handleGenerateMarquee} selectedColor={selectedColor} palette={palette} colorMap={LAUNCHPAD_COLOR_MAP_HEX} />}
      {isTypingModalOpen && <TypingTextModal onClose={() => setIsTypingModalOpen(false)} onGenerate={handleGenerateTyping} selectedColor={selectedColor} />}
      {isAIModalOpen && <AIPatternModal onClose={() => setIsAIModalOpen(false)} onGenerate={handleAIGenerate} />}
      {isPresetLibraryOpen.open && <PresetLibraryModal title={isPresetLibraryOpen.type === 'animation' ? "Animation Library" : "Effects Library"} presets={isPresetLibraryOpen.type === 'animation' ? ANIMATION_PRESETS : INTERACTIVE_PRESETS} onClose={() => setIsPresetLibraryOpen({ open: false, type: 'animation' })} onSelect={handlePresetSelect} />}
      {isTransformModalOpen && <TransformModal onTransform={handleTransform} onClose={() => setIsTransformModalOpen(false)} />}
      {isTransitionModalOpen && <TransitionModal onGenerate={handleCreateTransition} onClose={() => setIsTransitionModalOpen(false)} />}
    </div>
  );
};