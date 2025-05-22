const sharp = require('sharp');
const fs = require('fs').promises; // For asynchronous file operations

// Default input image path
const DEFAULT_IMAGE_PATH = 'image.png';
// Default resize factor (1/5th of original width)
const DEFAULT_RESIZE_FACTOR = 5;
// ASCII characters used to represent pixel intensity
const ASCII_CHAR_RANGE = ['.', ',', ':', ';', '+', '*', '?', '%', 'S', '#', '@'];

/**
 * Processes an image file using Sharp.
 *
 * @param {string} imagePath Path to the image file.
 * @param {number} resizeFactor Factor by which to divide the image width for resizing.
 * @returns {Promise<{data: Buffer, info: sharp.OutputInfo}>} A promise that resolves with the raw pixel data and image info.
 */
async function processImage(imagePath, resizeFactor) {
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  return image
    .resize(Math.round(metadata.width / resizeFactor))
    .gamma()
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
}

/**
 * Maps raw pixel data to an ASCII art string.
 *
 * @param {Buffer} data The raw pixel data buffer.
 * @param {sharp.OutputInfo} info Image information (width, height, channels).
 * @param {string[]} characterRange Array of ASCII characters to use for mapping.
 * @returns {string} The generated ASCII art string.
 */
function mapPixelsToAscii(data, info, characterRange) {
  // If 'data' is a Node.js Buffer, use its underlying ArrayBuffer.
  // If 'data' is already an ArrayBuffer (e.g., from tests), use it directly.
  const sourceArrayBuffer = (data.buffer instanceof ArrayBuffer && data.byteLength !== undefined) ? data.buffer : data;
  const rawPixelData = new Uint8ClampedArray(sourceArrayBuffer);
  let asciiArtString = ""; // Initialize an empty string
  const { width } = info;

  for (let i = 0; i < rawPixelData.length; i++) {
    const pixelIntensity = rawPixelData[i];
    const charIndex = Math.round(pixelIntensity / 255 * (characterRange.length - 1));
    asciiArtString += characterRange[charIndex] + ' '; // Append character and space
    if ((i + 1) % width === 0) { // Check (i+1) because loop is 0-indexed
      asciiArtString += '\n'; // Append newline
    }
  }
  return asciiArtString; // Return the concatenated string
}

/**
 * Main function to convert an image to ASCII art.
 */
async function main() {
  const imagePath = process.argv[2] || DEFAULT_IMAGE_PATH;
  
  let resizeFactor;
  const resizeFactorArg = process.argv[3]; // Get the command-line argument

  if (resizeFactorArg !== undefined) {
    // If an argument was provided, parse it
    resizeFactor = parseInt(resizeFactorArg);
  } else {
    // Otherwise, use the default
    resizeFactor = DEFAULT_RESIZE_FACTOR;
  }

  // Validate the determined resize factor
  if (isNaN(resizeFactor) || resizeFactor <= 0) {
    let errorMessage = "Error: Resize factor must be a positive number.";
    if (resizeFactorArg !== undefined) { // Add more detail if user provided an arg
        errorMessage += ` Provided value was '${resizeFactorArg}'.`;
    }
    console.error(errorMessage);
    process.exit(1); 
  }

  // Determine ASCII character range
  // Usage: node proc.js [imagePath] [resizeFactor] [customCharRangeString] [outputFilePath]
  // Example: node proc.js image.png 5 ".:-=+*#%@" output.txt
  let currentCharRange = ASCII_CHAR_RANGE; // Default
  const customCharRangeString = process.argv[4];

  if (customCharRangeString && customCharRangeString.length > 0) {
    currentCharRange = customCharRangeString.split('');
    if (currentCharRange.length === 0) { // Should not happen if customCharRangeString.length > 0, but as a safeguard
        console.warn("Warning: Custom character range string resulted in an empty array. Using default range.");
        currentCharRange = ASCII_CHAR_RANGE;
    }
  }

  try {
    const { data, info } = await processImage(imagePath, resizeFactor);
    const asciiArt = mapPixelsToAscii(data, info, currentCharRange); // Use determined range
    
    const outputFilePath = process.argv[5]; // Get output file path argument

    if (outputFilePath && outputFilePath.length > 0) {
      await fs.writeFile(outputFilePath, asciiArt);
      console.log(`ASCII art saved to ${outputFilePath}`);
    } else {
      console.log(asciiArt); // Default to console output
    }
  } catch (error) {
    console.error("Error processing image or writing file:", error); // Updated error message
    // process.exit(1); // Optionally, exit on other errors too
  }
}

// Only run main if the script is executed directly
if (require.main === module) {
  main();
}

module.exports = { mapPixelsToAscii, processImage, DEFAULT_IMAGE_PATH, DEFAULT_RESIZE_FACTOR, ASCII_CHAR_RANGE };
