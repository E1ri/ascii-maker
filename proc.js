const sharp = require('sharp');

const input = 'lain2.jpg'; //image name (example.jpg)

const image = sharp(input);
image
    .metadata()
    .then(metadata => {
        return image
            .resize(Math.round(metadata.width / 4)) //You can change size here example: .resize(width, height) or .resize(Math.round(metadata.width/YOUR_NUMBER))
            .gamma()
            .grayscale()
            .raw()
            .toBuffer({ resolveWithObject: true })
    })
    .then(({ data, info }) => {
        const pixelArray = new Uint8ClampedArray(data.buffer);
        const newPixelArray = [];
        const width = info.width;

        for (let x of pixelArray) {
            newPixelArray.push(Math.ceil(x / 255 * 10));
        }
        return {
            newPixelArray,
            width
        }
    })
    .then((get) => {
        const arr = get.newPixelArray;
        const width = get.width;
        for (let n = 0; n <= arr.length; n++) {
            switch (arr[n]) {
                case 0:
                    arr[n] = '  '
                    break;
            
                case 1:
                    arr[n] = "' "
                    break;

                case 2:
                    arr[n] = '" '
                    break;

                case 3:
                    arr[n] = ': '
                    break;

                case 4:
                    arr[n] = '; '
                    break;
                
                case 5:
                    arr[n] = '! '
                    break;
                
                case 6:
                    arr[n] = '* '
                    break;

                case 7:
                    arr[n] = '# '
                    break;

                case 8:
                    arr[n] = '$ '
                    break;

                case 9:
                    arr[n] = '% '
                    break;

                case 10:
                    arr[n] = '@ '
                    break;
            }
            if (n % (width + 1) === 0) {
                arr.splice(n, 0, '\n')
            }
        }
        console.log(arr.join(''));
    });
