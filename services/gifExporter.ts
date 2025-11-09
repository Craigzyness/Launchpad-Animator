// A simple, self-contained GIF encoder.
// Because we cannot add external dependencies, a minimal implementation is included here.
// Based on the work of jonaswicker/gif.js and matt-way/js-gif.
class GIFEncoder {
    private width: number;
    private height: number;
    private delay: number;
    private frames: Uint8Array[] = [];
    private palSize: number = 7;
    private trans: number = -1;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    setDelay(ms: number) {
        this.delay = Math.round(ms / 10);
    }

    addFrame(imageData: Uint8ClampedArray) {
        const indexedPixels = this.quantize(imageData);
        this.frames.push(indexedPixels);
    }

    finish(): Uint8Array {
        const stream = new ByteArray();
        stream.writeString('GIF89a');
        this.writeLSD(stream);
        this.writePalette(stream);
        stream.writeByte(0x21); // Application Extension Block
        stream.writeByte(0xff);
        stream.writeByte(11);
        stream.writeString('NETSCAPE2.0');
        stream.writeByte(3);
        stream.writeByte(1);
        stream.writeShort(0); // Loop forever
        stream.writeByte(0);

        for (let i = 0; i < this.frames.length; i++) {
            this.writeGraphicCtrlExt(stream, i === 0 ? this.delay : this.delay);
            this.writeImageDesc(stream);
            this.writePixels(stream, this.frames[i]);
        }

        stream.writeByte(0x3b); // Trailer
        return stream.getData();
    }

    private quantize(imageData: Uint8ClampedArray): Uint8Array {
        // Simple uniform quantization, sufficient for limited palette
        const indexed = new Uint8Array(this.width * this.height);
        for(let i = 0; i < indexed.length; i++) {
            const r = imageData[i * 4];
            const g = imageData[i * 4 + 1];
            const b = imageData[i * 4 + 2];
            indexed[i] = ((r & 0xE0) >> 5) | ((g & 0xE0) >> 2) | (b & 0xC0);
        }
        return indexed;
    }
    
    private writeLSD(stream: ByteArray) {
        stream.writeShort(this.width);
        stream.writeShort(this.height);
        stream.writeByte(0x80 | this.palSize); // Global color table flag
        stream.writeByte(0); // background color index
        stream.writeByte(0); // pixel aspect ratio
    }

    private writePalette(stream: ByteArray) {
        for(let i=0; i<256; ++i) {
            const r = (i & 0x7) << 5;
            const g = (i & 0x38) << 2;
            const b = (i & 0xC0);
            stream.writeByte(r);
            stream.writeByte(g);
            stream.writeByte(b);
        }
    }

    private writeGraphicCtrlExt(stream: ByteArray, delay: number) {
        stream.writeByte(0x21); // Extension introducer
        stream.writeByte(0xf9); // Graphic control label
        stream.writeByte(4); // block size
        stream.writeByte(0); // packed fields
        stream.writeShort(delay);
        stream.writeByte(this.trans); // transparent color index
        stream.writeByte(0); // block terminator
    }
    
    private writeImageDesc(stream: ByteArray) {
        stream.writeByte(0x2c); // image separator
        stream.writeShort(0); // image left position
        stream.writeShort(0); // image top position
        stream.writeShort(this.width);
        stream.writeShort(this.height);
        stream.writeByte(0); // packed fields
    }

    private writePixels(stream: ByteArray, pixels: Uint8Array) {
        const minCodeSize = 8;
        stream.writeByte(minCodeSize);

        let current = 0;
        while (current < pixels.length) {
            const size = Math.min(255, pixels.length - current);
            stream.writeByte(size);
            stream.writeBytes(pixels.subarray(current, current + size));
            current += size;
        }
        stream.writeByte(0); // Block terminator
    }
}

class ByteArray {
    private data: number[] = [];
    writeByte(val: number) { this.data.push(val & 0xff); }
    writeBytes(arr: Uint8Array) { for (let i = 0; i < arr.length; i++) this.writeByte(arr[i]); }
    writeShort(val: number) { this.writeByte(val); this.writeByte(val >> 8); }
    writeString(s: string) { for (let i = 0; i < s.length; i++) this.writeByte(s.charCodeAt(i)); }
    getData() { return new Uint8Array(this.data); }
}

const PAD_SIZE = 20;
const PAD_GAP = 4;
const GRID_SIZE = 8 * PAD_SIZE + 7 * PAD_GAP;

export const exportToGif = async (
    frames: Record<number, number>[],
    durations: number[],
    colorMap: Record<number, string>,
    onProgress: (progress: number) => void
) => {
    const canvas = document.createElement('canvas');
    canvas.width = GRID_SIZE;
    canvas.height = GRID_SIZE;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error("Could not create canvas context for GIF export.");
        return;
    }

    const encoder = new GIFEncoder(GRID_SIZE, GRID_SIZE);

    for (let i = 0; i < frames.length; i++) {
        // Yield to the browser to update UI
        await new Promise(resolve => setTimeout(resolve, 0));
        
        const frameData = frames[i];
        const duration = durations[i];

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const note = (8 - y) * 10 + (x + 1);
                const colorCode = frameData[note] || 0;
                ctx.fillStyle = colorMap[colorCode] || '#000000';
                ctx.fillRect(
                    x * (PAD_SIZE + PAD_GAP),
                    y * (PAD_SIZE + PAD_GAP),
                    PAD_SIZE,
                    PAD_SIZE
                );
            }
        }
        
        encoder.setDelay(duration);
        encoder.addFrame(ctx.getImageData(0, 0, GRID_SIZE, GRID_SIZE).data);
        onProgress( (i + 1) / frames.length);
    }
    
    const gifData = encoder.finish();
    const blob = new Blob([gifData], { type: 'image/gif' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'launchpad-animation.gif';
    a.click();
    URL.revokeObjectURL(url);
};
