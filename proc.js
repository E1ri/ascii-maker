const sharp = require('sharp');

const image = sharp('lain.png')
image
    .resize(150, 256)
    .gamma()
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
        const pixelArray = new Uint8ClampedArray(data.buffer);
        let newPixelArray = [];

        for (let x of pixelArray) {
            newPixelArray.push(Math.ceil(x / 255 * 10));
        }
        return {
            newPixelArray
        }
    })
    .then((newPixelArray) => {
        const arr = newPixelArray.newPixelArray;
        for (let n = 0; n <= arr.length; n++) {
            switch (arr[n]) {
                case 0:
                    arr[n] = '. '
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
            if (n % 151 === 0) {
                arr.splice(n, 0, '\n')
            }
        }
        console.log(arr.join(''));
    });
