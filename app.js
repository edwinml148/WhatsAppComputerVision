const fs = require('fs');
const ora = require('ora'); // Se requiere la version 5.4.1
const chalk = require('chalk'); // se requiere la version 4.1.2
const ExcelJS = require('exceljs');
const moment = require('moment');
const qrcode = require('qrcode-terminal');
const Jimp = require('jimp');
const jpeg = require('jpeg-js');
const cv = require('./node_modules/opencv.js');
const { Client, LocalAuth , MessageMedia } = require('whatsapp-web.js');

const SESSION_FILE_PATH = './.wwebjs_auth';
let sessionData;
let client;

cv.FS_createLazyFile('/', 'haarcascade_frontalface_default.xml','haarcascade_frontalface_default.xml', true, false);

const withSession = () => {
    const spinner = ora(`Cargando${chalk.yellow(' Validando session con WhatsApp ...\n')}`);
    spinner.start();

    client = new Client({
        authStrategy: new LocalAuth({ clientId: "hola" }),
        puppeteer: { 
            headless: true, 
            args: ['--no-sandbox']
        }
    });

    client.on('authenticated',session => {
        sessionData = session;  
    });

    client.on('ready', () => {
        console.log("El Cliente esta listo...\n");
        spinner.stop();
        listenMessage();
    });

    client.on('auth_failure', () => {
        spinner.stop()
        console.log(chalk.red('Error de autenticacion vuelve a generar el QRCODE'))
    })

    client.initialize();
}

/* Se llamara cuando no se tenga la carpeta de autenticacion */
const withOutSession = () => {
    console.log("No tenemos session guardada ...");
    client = new Client({
        authStrategy: new LocalAuth({ clientId: "hola" }), 
        puppeteer: { 
            headless: true, 
            args: ['--no-sandbox'] 
        }
    });

    client.on('qr', (qr) => {
        qrcode.generate(qr,{ small : true });
    });

    client.on('authenticated',session => {
        sessionData = session;  
    });

    client.initialize();
}

/* Esta funcion es para escuchar los mensajes */
const listenMessage = () => {
    client.on('message' , (msg) => {
        const { from , to , body } = msg;

        sendDownloadMedia(msg,from)

        /*Preguntas frecuentes*/
        switch (body) {
            case 'Quiero comunicarme con el bot':
                sendMessage(from,'Hola 👋​! Soy el bot de computer vision 🤖​ las opciones que tenemos son :\n*- Dilatacion*\n*- Borde*\n*- Gray*\n*- Face Detection*');
                break;
            case 'Dilatacion':
                checkHistory(from , 'Quiero comunicarme con el bot' , "Envia la imagen para procesarla 🦾");
                break;
            case 'Borde':
                checkHistory(from , 'Quiero comunicarme con el bot' , "Envia la imagen para procesarla 🦾");
                break;
            case 'Gray':
                checkHistory(from , 'Quiero comunicarme con el bot' , "Envia la imagen para procesarla 🦾");
                break;
            case 'Face Detection':
                checkHistory(from , 'Quiero comunicarme con el bot' , "Envia la imagen para procesarla 🦾");
                break;
            case '':
                pause().then();
                processSentImage(from);
                break;
        }
        saveHistory(from,body)
        console.log(from , to , body); 
    })
}

/*Envio de mensajes multimedia*/
const sendMedia = (to,file) => {
    const mediaFile = MessageMedia.fromFilePath(`./${file}`);
    client.sendMessage(to,mediaFile);
}

/*Envio de mensajes*/
const sendMessage = (to, message) => {
    console.log("#### Mensaje enviado ####")
    client.sendMessage(to,message)
}

/*Descarga mensajes multimedia*/
const sendDownloadMedia = (msg , from) => {
    client.on('message', async msg => {
        if(msg.hasMedia) {
            const media = await msg.downloadMedia();
            const buffer = Buffer.from(media.data, "base64");
            fs.writeFileSync(`${from}`+".jpg", buffer);
        }
    });
}

/*Guardar el historial de los chats*/
const saveHistory = (number,message) => {
    const pathChat = `./chats/${number}.xlsx`;
    const workbook = new ExcelJS.Workbook();
    const today = moment().format('DD-MM-YYYY hh:mm');
    console.log("Directorio : ",pathChat,fs.existsSync(pathChat),'\n')
    if (fs.existsSync(pathChat)) {
        workbook.xlsx.readFile(pathChat)
        .then(() => {
            const worksheet = workbook.getWorksheet(1);
            const lastRow = worksheet.lastRow;
            let getRowInsert = worksheet.getRow(++(lastRow.number))
            getRowInsert.getCell('A').value = today;
            getRowInsert.getCell('B').value = message;
            getRowInsert.commit();
            workbook.xlsx.writeFile(pathChat)
            .then(() => {
                console.log("Se agrego el Chat al historial");
            })
            .catch(() => {
                console.log("Algo ocurrio...");
            })

        })
    } else {
        const worksheet = workbook.addWorksheet('chats');
        worksheet.columns = [
            { header: 'Fecha', key: 'date'},
            { header: 'Mensaje', key: 'message' },
        ]
        worksheet.addRow([today,message])
        console.log("hasta aca bien...")
        
        workbook.xlsx.writeFile(pathChat)
            .then(() => {
                console.log('Historial creado...');
            })
            .catch(() => {
                console.log('Algo fallo!');
            })
    }

}

/*Revisar el historial del ultimo registro de un chat*/
const checkHistory = (number , msg_check , msg_send) => {
    const pathChat = `./chats/${number}.xlsx`;
    const workbook = new ExcelJS.Workbook();
    if (fs.existsSync(pathChat)) {
        workbook.xlsx.readFile(pathChat)
        .then(() => {
            const worksheet = workbook.getWorksheet(1);
            const lastRow = worksheet.lastRow;
            let getRowInsert = worksheet.getRow(lastRow.number)

            if ( getRowInsert.getCell('B').value == msg_check){
                sendMessage(number,msg_send);
            }

        })
    }
}

/*Logica encargada de procesamiento de imagenes*/
async function imageProcessingLogic(number,operacion){
    console.log("Se cargo correctamente la imagen ............................");

    if (operacion == 'Dilatacion'){
        var jpeg_data = fs.readFileSync(`${number}`+".jpg");
        var raw_data = jpeg.decode(jpeg_data);

        var src = cv.matFromImageData(raw_data);
        let dst = new cv.Mat();
        let M = cv.Mat.ones(5, 5, cv.CV_8U);
        let anchor = new cv.Point(-1, -1);
        cv.dilate(src, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
        //cv.putText(frame, name, {x: rect.x, y: rect.y}, cv.FONT_HERSHEY_SIMPLEX, 1.0, [0, 255, 0, 255]);
        image = new Jimp({
            data: dst.data,
            width: dst.size().width,
            height: dst.size().height
        });

        const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
        image.print(font,0 , 0 ,"-By NickML");
        image.write("Output.jpg");
    }

    if (operacion == 'Borde'){
        var jpeg_data = fs.readFileSync(`${number}`+".jpg");
        var raw_data = jpeg.decode(jpeg_data);

        var src = cv.matFromImageData(raw_data);
        cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY); // Convert to grayscale
        dst = new cv.Mat();
        cv.Canny(src, dst, 50, 150);
        cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA); // Convert back to RGBA to display
        
        image = new Jimp({
          data: dst.data,
          width: dst.size().width,
          height: dst.size().height
        });

        const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
        image.print(font,0 , 0 ,"-By NickML");
        image.write("Output.jpg");
    }

    if (operacion == 'Gray'){
        var image = await Jimp.read(`${number}`+".jpg");
        image.grayscale()
        const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
        image.print(font,0 , 0 ,"-By NickML");
        image.write("Output.jpg");
    }

    if (operacion == 'Face Detection'){
        var jpeg_data = fs.readFileSync(`${number}`+".jpg");
        var raw_data = jpeg.decode(jpeg_data);
        var src = cv.matFromImageData(raw_data);
        let gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        let faces = new cv.RectVector();
        let eyes = new cv.RectVector();
        let faceCascade = new cv.CascadeClassifier();
        faceCascade.load('haarcascade_frontalface_default.xml');
        faceCascade.detectMultiScale(gray, faces, 1.3, 5)

        for (let i = 0; i < faces.size(); ++i) {
            let roiGray = gray.roi(faces.get(i));
            let roiSrc = src.roi(faces.get(i));
            let point1 = new cv.Point(faces.get(i).x, faces.get(i).y);
            let point2 = new cv.Point(faces.get(i).x + faces.get(i).width,
                                        faces.get(i).y + faces.get(i).height);
            cv.rectangle(src, point1, point2, [255, 0, 0, 255],2);
            //roiGray.delete(); roiSrc.delete();
        }

        image = new Jimp({
            data: src.data,
            width: src.size().width,
            height: src.size().height
        });

        const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
        image.print(font,0 , 0 ,"-By NickML");
        image.write("Output.jpg");
    } 
}

/*Revisar el historial de los 3 ultimos registros de un chats*/
const checkHistoryOfThrreMsg = (number) => {
    const pathChat = `./chats/${number}.xlsx`;
    const workbook = new ExcelJS.Workbook();
    if (fs.existsSync(pathChat)) {
        workbook.xlsx.readFile(pathChat)
        .then(() => {
            const worksheet = workbook.getWorksheet(1);
            const lastRow = worksheet.lastRow;

            let getRowInsert1 = worksheet.getRow(lastRow.number)
            let getRowInsert2 = worksheet.getRow(lastRow.number-1)
            let getRowInsert3 = worksheet.getRow(lastRow.number-2)

            if (fs.existsSync(`${number}`+".jpg") && getRowInsert1.getCell('B').value == '' && getRowInsert3.getCell('B').value == 'Quiero comunicarme con el bot'){
                sendMessage(number,'Imagen procesada 🥳​, espera 10 segundos para recibirla ​👀​')
                
                if (getRowInsert2.getCell('B').value == 'Dilatacion' ){
                    imageProcessingLogic(number,'Dilatacion')
                }
                if (getRowInsert2.getCell('B').value == 'Borde' ){
                    imageProcessingLogic(number,'Borde')
                }
                if (getRowInsert2.getCell('B').value == 'Gray' ){
                    imageProcessingLogic(number,'Gray')
                }
                if (getRowInsert2.getCell('B').value == 'Face Detection' ){
                    imageProcessingLogic(number,'Face Detection')
                }
                sendMediaOutput(number)
            } else {
                console.log("El archivo aun no es creado .......")
                console.log(fs.existsSync(`${number}`+".jpg"))
            }
        })
    }
}

/*Pausa*/
const pause = () => {
    return new Promise( (resolve,reject) => {
        setTimeout( () => {
            resolve();
        }, 7000);
    });
}

/*Asincrona - Procesando la imagen enviada*/
async function processSentImage (from) {
    //console.log('Taking a break ###1...');
    const datosFetched = await pause();
    checkHistoryOfThrreMsg(from);
    //console.log('10 second later ###1')
}

/*Asincrona - Envio de el mensaje multimedia procesado*/
async function sendMediaOutput (from) {
    //console.log('Taking a break 2... ###2');
    const datosFetched = await pause();
    sendMedia(from,"Output.jpg");
    //console.log('10 second later ###2');
}

/////////// GATILLA todo el funcionamiento de la APP ////////
(fs.existsSync(SESSION_FILE_PATH)) ? withSession() : withOutSession();