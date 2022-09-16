# FilterFaceApp

## Índice

* [1. Motivacion](#1-Motivacion)
* [2. Uso en entorno local](#2-Uso-en-entorno-local)
* [3. Deteccion de rostros](#3-Deteccion-de-rostros)
* [4. Filtros personalizados](#4-Filtros-personalizados)
* [5. Creacion de filtros](#5-Creacion-de-filtros)


***

## 1. Motivacion


FilterFaceApp es una WebApp de vision artificial en tiempo real desarrollada en [ Streamlit ](https://streamlit.io/) y montada en [Heroku](https://dashboard.heroku.com/apps) con el objetivo crear tus propios filtros personalizados, estos pueden ser aplicados directamente a todo el video o espeficiamente a caras detectadas.

Streamlit es un excelente framework para científicos de datos, investigadores y desarrolladores de aprendizaje automático, y streamlit-webrtc lo amplía para poder manejar transmisiones de video (y audio) en tiempo real.

Puedes probarlo aqui : https://filterfaceapp.herokuapp.com/

<div style="text-align: center;">
  <br><br/>
  <img src="multimedia/FilterFaceApp.gif">
  <br><br/>
</div>

***

## 2. Uso en entorno local

Para el uso en entorno local de FilterFaceApp se requiere tener instalado una version de igual o superior a Python 3.8 , se recomienda tener instalado el IDE **Visual Studio Code** y **git** . Se requiere instalar las siguientes librerias.

* streamlit == 1.5.1
* numpy == 1.22.2
* streamlit-webrtc == 0.35.0
* opencv-contrib-python-headless == 4.5.5.62
* av == 8.1.0

Se recomienda el uso de un entorno virtual usando virtualenv o anaconda. En este proyecto usamos virtualenv y detallaremos como realizarlo.

1. Abrir cmd con permisos de administrador.

<div style="text-align: center;">
  <br><br/>
  <img src="multimedia/cmd0.png">
  <br><br/>
</div>



2. Ingresa a la ruta donde estara el proyecto.

<div style="text-align: center;">
  <br><br/>
  <img src="multimedia/cmd1.PNG">
  <br><br/>
</div>



3. Añadir los siguientes comandos :
 
    * ```python -m venv nombre_de_mi_entorno```
    * ```.\nombre_de_mi_entorno\Scripts\activate```
    * ```git init```
    * ```git clone https://github.com/edwinml148/FilterFaceApp.git```

<div style="text-align: center;">
  <br><br/>
  <img src="multimedia/cmd3.PNG">
  <br><br/>
</div>

4. Mover los archivos de la carpeta clonada al directorio principal del proyecto.

<div style="text-align: center;">
  <br><br/>
  <img src="multimedia/cmd4.PNG">
  <br><br/>
</div>



5. Instalar las librerias con el comando ```pip install -r requirements.txt```

<div style="text-align: center;">
  <br><br/>
  <img src="multimedia/cmd5.PNG">
  <br><br/>
</div>

6. Ahora si podemos usar nuestra WebApp en entorno local con el comando ```streamlit run FilterFaceApp.py``` , se abrira una ventana en el navegador con el localhost.

<div style="text-align: center;">
  <br><br/>
  <img src="multimedia/cmd6.PNG">
  <br><br/>
  <img src="multimedia/cmd7.PNG">
  <br><br/>
</div>


***

## 3. Deteccion de rostros

FilterFaceApp detecta rostros en video-stream en tiempo real usando dos algortimos, El primero es un clasificador pre-entrenado de Haar Cascades y el segundo es la deteccion de objetos a multiples escalas ( detectMultiScale ).


EL clasificador Haar Cascades es un enfoque de machine learning para la deteccion visual de objetos que es capaz de procesar imagenes extramadamente rapido , gracias que combina los conceptos de imagenes integral y un algortimo de aprendizaje de AdaBoost.Podras encontrar mayor informacion en el siguiente paper https://www.cs.cmu.edu/~efros/courses/LBMV07/Papers/viola-cvpr-01.pdf.

En este proyecto usaremos los modelos pre-entrenados de *haarcascade_frontalface_default.xml* ( Entrenado con imagenes frontales de caras ) y *haarcascade_eye.xml* ( Entrenado con imagenes de ojos )

<div style="text-align: center;">
  <br><br/>
  <img src="multimedia/hola.png">
  <br><br/>
</div>

DetectMultiScale, es un algortimo que realiza una busqueda de caras realizando un varios barridos de la imagen con ventanas de diferentes tamaños (ya que puede haber caras grandes cercanas o pequeñas que estén más lejanas).

<div style="text-align: center;">
  <br><br/>
  <img src="multimedia/elena.gif">
  <br><br/>
</div>


```detectMultiScale(img, scaleFactor, minNeighbors, minSize, maxSize )```.

* *img* : Es una imagene en escala de grises en donde va a actuar el detector de rostros.
* *ScaleFactor* : Este parametro especifica que tanto va aumentar o reducir el tamaño de la imagen original
* *minNeighbors* : Especifica el numero minimo de cuadrados delimitadores o vecinos que debe tener el rostro para que sea detectado como tal.
* *Minsize* : El tamaño minimo del cuadro delimitador.
* *Maxsize* : El tamaño maximo del cuadrado delimitador.  

***

## 4. Filtros personalizados

Para la deteccion de rostros se convierte la imagen color a escala de grises ```gray = cv2.cvtColor(img , cv2.COLOR_BGR2GRAY)``` luego se aplica ```detectMultiScale(img, scaleFactor, minNeighbors, minSize, maxSize )```. El cual nos da como resultado la posicion en fila , columna , largo y ancho de los cuadros delimitadores de todos los rostros detectados.

La variable ```threshold1``` controla el valor de ```minSize``` y ```maxSize```. Estos parametros nos permite controlar el tamaño del cuadro delimitador de los rostros . A mayor valor de ```threshold1``` se detectara rostros mas cerca de la camara. A menor valor , se detectara rostros mas lejos de la camara. 

### 4.1 Deteccion de rostros y ojos

Luego de aplicar la logica de deteccion de rostros , en la variable ```gray_cara``` se toma un recorte de la imagen de entrada donde se detecto los rostros. En este recorte se realiza la deteccion de los ojos, se dibuja el cuadrado delimitador bajo la condicion de deteccion de 2 ojos.

<div style="text-align: center;">
  <br><br/>
  <img src="multimedia/filter1.PNG">
  <br><br/>
  <img src="multimedia/filtro_deteccionderostroojos.PNG">
  <br><br/>
</div>

### 4.2 Blurring

Luego de aplicar la logica de deteccion de rostros , se aplica un filtro de suavizado de media, el cual se realiza mediante una operacion de convolucion entre la imagen de entrada y un matriz o kernel de tamaño regulable. 

<div style="text-align: center;">
  <br><br/>
  <img src="multimedia/filter2.PNG">
  <br><br/>
  <img src="multimedia/filtro_blurring.PNG">
  <br><br/>
</div>

### 4.3 Reemplaza cara por imagen

Para este filtro se debe añadir una imagen en formato .jpg , el cual se usara para reemplazar los rostros por esta imagen. Para poder aplicar este reemplazo debemos reescalar el tamaño de esta imagen. 

<div style="text-align: center;">
  <br><br/>
  <img src="multimedia/filter3.PNG">
  <br><br/>
  <img src="multimedia/filtro_reemplazarface.PNG">
  <br><br/>
</div>

***

## 5. Creacion de filtros

Antes de explicar como crear e incorporar nuevos filtros , veamos la estructura del codigo fuente. En la parte superior donde estan las clases va la logica de cada filtro , en la variable ```option``` se almacena la seleccion del box y el valor cambiara dependiendo el tipo del filtro. Con esta eleccion el codigo ingresa al if seleccionado.

<div style="text-align: center;">
  <br><br/>
  <img src="multimedia/filtro_creacion.PNG">
  <br><br/>
</div>

Ahora si veamos que debemos adicionar al codigo para crear nuestro propio filtro.

<div style="text-align: center;">
  <br><br/>
  <img src="multimedia/filtro_creacion_1.PNG">
  <br><br/>
</div>

Para diseñar un nuevo filtro se debe agregar una nueva clase, dentro de esta se estable la logica de deteccion de rostros. Luego  se realiza un recorte de la imagen ```img[y:y+h,x:x+w]``` apartir de aqui se puede aplicar tecnicas de procesamiento de imagenes como variacion de contraste , brillo , correccion gamma , filtro de suavizado , filtro de diferencia entre otros.

<div style="text-align: center;">
  <br><br/>
  <img src="multimedia/filtro_creacion_2.PNG">
  <br><br/>
</div>

Por ultimo debemos añadir un nuevo elemento en la tupla de opciones, seguido de estos incorporar un nuevo ```if``` con el nombre de la opcion incorporada. 

***

