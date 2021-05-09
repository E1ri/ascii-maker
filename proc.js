const sharp = require('sharp');

const input = 'image.png'; //image name (example.jpg)

const range = ` '":;!*%#$@`.split('');
const image = sharp(input);
image
    .metadata()
    .then(metadata => {
        return image
            .resize(Math.round(metadata.width / 5)) //You can change size here example: .resize(width, height) or .resize(Math.round(metadata.width/YOUR_NUMBER))
            .gamma()
            .grayscale()
            .raw()
            .toBuffer({ resolveWithObject: true })
    })
    .then(({ data, info }) => {
        const pixelArray = new Uint8ClampedArray(data.buffer);
        const newPixelArray = [];
        const width = info.width;

        for (let x = 0; x < pixelArray.length; x++) {
            newPixelArray.push(range[Math.round(pixelArray[x] / 255 * 10)] + ' ');
            if (x % width === 0) {
                newPixelArray.push('\n');
            }
        }
        console.log(newPixelArray.join(''));
    })