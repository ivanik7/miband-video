const q = (query) => document.querySelector(query);

const logEl = q("#log");
const log = (string) => {
    console.log(string);

    if (typeof string === "string") {
        logEl.innerHTML += string + "\n";
    } else {
        logEl.innerHTML += JSON.stringify(string) + "\n";
    }
};
log("ds");

const video = q("video");
const canvas = q("canvas");
const ctx = canvas.getContext("2d");
const preview = q("#pv");

let frame;

const updateFrame = () => {
  ctx.drawImage(video, 0, 0, h, w);
  ctx.fill();

  frame = ctx.getImageData(0, 0, w, h);

  window.fkek = frame;
};

const getPixel = (x, y) => {
  const r = frame.data[(frame.width * y + x) * 4];
  const g = frame.data[(frame.width * y + x) * 4 + 1];
  const b = frame.data[(frame.width * y + x) * 4 + 2];
  const a = frame.data[(frame.width * y + x) * 4 + 3];
  return r + b + g + a > 255;
};

const send = async (char, titile, count) => {
    let str = `${titile}\0`;

    var buf = new ArrayBuffer(str.length + 4 + count * 3);
    var bufView = new Uint8Array(buf);

    let pos = 0;
    bufView[pos++] = -6;
    bufView[pos++] = 1;
    bufView[pos++] = 12; // номер иконки

    for (let i = 0; i < str.length; i++) {
        bufView[pos++] = str.charCodeAt(i);
    }


    /**\
     * e2 a0 80
     * e2 a1 bf
     * e2 a3 bf
     */
    for (let i = 0; i < count; i++) {
        // c = 0
        // c += 1 << 0;
        // c += 1 << 1;
        // c += 1 << 2;
        // c += 1 << 6;
        // c += 1 << 3;
        // c += 1 << 4;
        // c += 1 << 5;
        // c += 1 << 7;
        let c = 1 + 0x2800;
        bufView[pos++] = 0xe2
        bufView[pos++] = 0x80 | (c >> 6);
        bufView[pos++] = 0x80 | (c & 0x3f);
    }

    await char.writeValue(bufView);
};

q("#connect").addEventListener("click", async () => {
    try {
        log("Connecting..");
        const dev = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [0x1811],
        });
        log(dev);

        dev.addEventListener("gattserverdisconnected", (...args) => {
            log("disconnect");
            log(args);
        });

        const gatt = await dev.gatt.connect();
        log("connected");

        const service = await gatt.getPrimaryService(0x1811);
        const characteristic = await service.getCharacteristic(0x2a46);

        // await send(characteristic, 'i', 80, 0);
        await send(characteristic, '', 80, 0);


    } catch (error) {
        log(error.message);
    }
});