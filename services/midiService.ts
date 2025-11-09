// FIX: Import GRID_NOTES to be used in the new getNoteFromMouse function.
import { GRID_NOTES } from '../constants';

export interface LaunchpadDevice {
  id: string; // From the MIDIOutput
  name: string;
}

let outputDevice: MIDIOutput | null = null;
let inputDevices: MIDIInput[] = [];
let midiAccess: MIDIAccess | null = null;
let onMidiMessageCallback: ((data: Uint8Array) => void) | null = null;

const LAUNCHPAD_NAME = "Launchpad MK2";

const getMidiAccess = async (): Promise<MIDIAccess> => {
    if (midiAccess) {
        return midiAccess;
    }
    if (!navigator.requestMIDIAccess) {
        console.error("Web MIDI API is not supported in this browser.");
        throw new Error("Web MIDI API not supported.");
    }
    const access = await navigator.requestMIDIAccess({ sysex: true });
    // Add a state change listener for debugging. This helps see if the browser
    // recognizes the device connecting or disconnecting.
    // FIX: Use the available 'MIDIConnectionEvent' type, which provides the necessary 'port' property.
    access.onstatechange = (event: MIDIConnectionEvent) => {
        console.log(
            `MIDI Port state change: ${event.port.id} ${event.port.name} ${event.port.state}`
        );
        console.log(event)
    };
    midiAccess = access;
    return midiAccess;
};

export const getAvailableLaunchpads = async (): Promise<LaunchpadDevice[]> => {
    const access = await getMidiAccess();
    const devices: LaunchpadDevice[] = [];
    access.outputs.forEach((output) => {
        // Use `includes` to robustly find Launchpads even if the OS adds suffixes.
        if (output.name?.includes(LAUNCHPAD_NAME)) {
            devices.push({ id: output.id, name: output.name });
        }
    });
    return devices;
};

export const setMidiMessageHandler = (callback: ((data: Uint8Array) => void) | null) => {
    onMidiMessageCallback = callback;
};

const handleGlobalMidiMessage = (event: MIDIMessageEvent) => {
    // Log all incoming MIDI messages for easier debugging of input issues.
    console.log("MIDI In:", event.data);
    if (onMidiMessageCallback && event.data) {
        onMidiMessageCallback(event.data);
    }
};

export const connect = async (deviceId: string, messageHandler: (data: Uint8Array) => void): Promise<boolean> => {
    try {
        const access = await getMidiAccess();
        
        // Disconnect from any previous session
        await disconnect(); 
        
        setMidiMessageHandler(messageHandler);

        const selectedOutput = access.outputs.get(deviceId);
        if (!selectedOutput) {
            throw new Error(`Output device with ID "${deviceId}" not found.`);
        }

        // Attempt to find a matching input device. An exact name match is preferred.
        let selectedInput: MIDIInput | undefined;
        const potentialInputs: MIDIInput[] = [];
        access.inputs.forEach(input => {
            if (input.name?.includes(LAUNCHPAD_NAME)) {
                potentialInputs.push(input);
                // Prioritize an exact name match
                if (input.name === selectedOutput.name) {
                    selectedInput = input;
                }
            }
        });

        // If no exact match was found, use the first available matching input
        if (!selectedInput && potentialInputs.length > 0) {
            selectedInput = potentialInputs[0];
        }

        if (!selectedInput) {
            throw new Error(`Could not find a matching input port for "${selectedOutput.name}". Please ensure the device is not in use by another application.`);
        }

        // Open ports. These return promises that resolve when open, or reject on error.
        await selectedOutput.open();
        outputDevice = selectedOutput;

        await selectedInput.open();
        // Clear previous input devices and add the newly connected one
        inputDevices = [selectedInput];
        selectedInput.addEventListener('midimessage', handleGlobalMidiMessage);
        
        // Initialize the device hardware to the correct mode
        clearPads();

        return true;
    } catch (error) {
        console.error("MIDI Connection Failed:", error);
        // Clean up any partially opened ports on failure
        await disconnect();
        // Re-throw the error so the UI layer can handle it (e.g., show a message)
        throw error;
    }
};


export const disconnect = async (): Promise<void> => {
  // Explicitly close ports and clear pads on disconnect.
  if (outputDevice) {
    clearPads();
    await outputDevice.close();
  }
  await Promise.all(inputDevices.map(input => {
    input.removeEventListener('midimessage', handleGlobalMidiMessage);
    return input.close();
  }));
  
  setMidiMessageHandler(null);
  inputDevices = [];
  outputDevice = null;
};

export const lightPad = (note: number, color: number): void => {
  if (outputDevice) {
    outputDevice.send([0x90, note, color]);
  }
};

export const lightFrame = (frame: Record<number, number>): void => {
  if (outputDevice) {
    // FIX: Implement a highly efficient batch update using a single SysEx message.
    // This is the standard and most reliable way to update the entire grid,
    // avoiding potential rate-limiting issues from sending many individual messages.
    // The command format is: F0 00 20 29 02 18 0A <pad> <color> [<pad> <color>...] F7
    const command: number[] = [240, 0, 32, 41, 2, 24, 10]; // SysEx header for batch lighting by color code

    const notes = Object.keys(frame).map(Number);
    for (const note of notes) {
        const color = frame[note] || 0;
        command.push(note, color);
    }

    command.push(247); // SysEx footer

    try {
        outputDevice.send(command);
    } catch (error) {
        console.error("Failed to send SysEx message to Launchpad:", error);
        // This can happen if the message is too large, but our frames should be fine.
    }
  }
};

export const clearPads = (): void => {
  if (outputDevice) {
    // This SysEx message sets the Launchpad MK2 to "Programmer" layout, which is a
    // robust way to initialize the device and ensure it's ready for lighting commands.
    // It's more explicit than just toggling session mode.
    // F0 00 20 29 02 18 22 01 F7
    outputDevice.send([240, 0, 32, 41, 2, 24, 34, 1, 247]);
  }
};

// FIX: Implement the missing 'getNoteFromMouse' function. This function is called
// from a global mouseup handler in App.tsx to determine which pad was under the
// cursor when a drag-and-draw operation finished.
export const getNoteFromMouse = (clientX: number, clientY: number): number | null => {
    const gridEl = document.getElementById('launchpad-grid');
    if (!gridEl) return null;

    const rect = gridEl.getBoundingClientRect();
    
    // Check if mouse is outside the element bounds
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
        return null;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Simple percentage-based calculation, assuming even grid distribution
    const relX = x / rect.width;
    const relY = y / rect.height;

    const col = Math.floor(relX * 8);
    const row = Math.floor(relY * 8);

    if (col >= 0 && col < 8 && row >= 0 && row < 8) {
        // GRID_NOTES is indexed by [row][col]
        return GRID_NOTES[row][col];
    }

    return null;
};

export const isConnected = (): boolean => {
  return !!outputDevice;
};
