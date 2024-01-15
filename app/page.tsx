"use client"

import { ModeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { beep } from '@/utils/audio'
import { Camera, FlipHorizontal, MoonIcon, PersonStanding, SunIcon, Video, Volume2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Rings } from 'react-loader-spinner'
import Webcam from 'react-webcam'
import { toast } from 'sonner'
import * as cocossd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-backend-webgl'
import { DetectedObject, ObjectDetection } from '@tensorflow-models/coco-ssd'
import { drawnOnCanvas } from '@/utils/draw'
import SocialMediaLinks from '@/components/social-media'

type Props = {}

let interval: any = null;
let stopTimeout: any = null;
const HomePage = (props: Props) => {

  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [mirrored, setMirrored] = useState<boolean>(false)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [autoRecordEnabled, setAutoRecordEnabled] = useState<Boolean>(false)
  const [volume, setVolume] = useState(0.8);
  const [model, setModel] = useState<ObjectDetection>()
  const [loading, setLoading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null >(null)
  
  useEffect(()=>{
    if(webcamRef && webcamRef.current){
        const stream = (webcamRef.current.video as any).captureStream();

        if(stream){
          mediaRecorderRef.current = new MediaRecorder(stream)

          mediaRecorderRef.current.ondataavailable = (e) =>{
            if(e.data.size > 0){
              const recordedBlob = new Blob([e.data], {type: 'video'});
              const videoURL = URL.createObjectURL(recordedBlob);


              const a = document.createElement('a');
              a.href = videoURL;

              a.download = `${formatDate(new Date())}.webm`;
              a.click();
            }
          }

          mediaRecorderRef.current.onstart = (e) =>{
            setIsRecording(true);
          }

          mediaRecorderRef.current.onstop = (e)=>{
            setIsRecording(false);
          }
        }
    }
  }, [webcamRef])
  useEffect(()=>{
    setLoading(true);
     initModel();
  }, [])

  //loads Model
  //set it in a state varibale
  async function initModel() {
    const loadedModel: ObjectDetection = await cocossd.load({
      base: 'mobilenet_v2'
    })

    setModel(loadedModel);
  }

  useEffect(()=>{
    if(model){
      setLoading(false);
    }
    
     
  }, [model])

  useEffect(()=>{
    interval = setInterval(()=>{
        runPrediction();
     },100);

     return ()=> clearInterval(interval); 
  }, [webcamRef.current, model, mirrored, autoRecordEnabled])

  async function runPrediction(){
    if(
      model
       && webcamRef.current
      && webcamRef.current.video?.readyState === 4
    ){
      const predictions: DetectedObject[] =await model.detect(webcamRef.current.video)

      resizeCanvas(canvasRef, webcamRef);
      drawnOnCanvas(mirrored, predictions, canvasRef.current?.getContext('2d'));
      
      let isPerson: boolean=false;
      if(predictions.length>0){
        predictions.forEach((prediction)=>{
          isPerson = prediction.class === 'person';
        })
      }

      if(isPerson && autoRecordEnabled){
        startRecording(true );
      }
    }
  }
  const userPromptScreenshot = ()=>{
    if(!webcamRef.current){
      toast('Camera not found. please refresh')
    }
    else{
      const imgSrc = webcamRef.current.getScreenshot();
      console.log(imgSrc);
      const blob = convertBase64ToBlob(imgSrc);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download= `${formatDate(new Date())}.png`
      a.click();
    }
  }

  const userPromptScreenrecorder = ()=>{

  }

  const userPromptRecord = ()=>{
    if(!webcamRef.current){
      toast('camera not found. Please refresh.')
    }

    if(mediaRecorderRef.current?.state == 'recording'){
      mediaRecorderRef.current.requestData();
      clearTimeout(stopTimeout);
      mediaRecorderRef.current.stop();
      toast('Recording saved to downloads')

    }else{
      startRecording(false);
    }
  }


  function startRecording(doBeep: boolean){
    if(webcamRef.current && mediaRecorderRef.current?.state !== 'recording'){
      toast("Recoding started")
      mediaRecorderRef.current?.start();
      doBeep && beep(volume);
      
      stopTimeout =  setTimeout(() => {
        if(mediaRecorderRef.current?.state === 'recording'){
          mediaRecorderRef.current.requestData();
          mediaRecorderRef.current.stop();
        }
      }, 30000);
    }
  }
  

  const toggleAutoRecord = ()=>{
      if(autoRecordEnabled){
        setAutoRecordEnabled(false);
        toast('Autorecord disabled')
        //show toast
      }else{
        setAutoRecordEnabled(true)
        toast('Autorecord Enabled')

      }
  }

  function RenderFeatureHighlightsSection() {
    return <div className="text-xs text-muted-foreground">
      <ul className="space-y-4">
        <li>
          <strong>Dark Mode/Sys Theme 🌗</strong>
          <p>Toggle between dark mode and system theme.</p>
          <Button className="my-2 h-6 w-6" variant={"outline"} size={"icon"}>
            <SunIcon size={14} />
          </Button>{" "}
          /{" "}
          <Button className="my-2 h-6 w-6" variant={"outline"} size={"icon"}>
            <MoonIcon size={14} />
          </Button>
        </li>
        <li>
          <strong>Horizontal Flip ↔️</strong>
          <p>Adjust horizontal orientation.</p>
          <Button className='h-6 w-6 my-2'
            variant={'outline'} size={'icon'}
            onClick={() => {
              setMirrored((prev) => !prev)
            }}
          ><FlipHorizontal size={14} /></Button>
        </li>
        <Separator />
        <li>
          <strong>Take Pictures 📸</strong>
          <p>Capture snapshots at any moment from the video feed.</p>
          <Button
            className='h-6 w-6 my-2'
            variant={'outline'} size={'icon'}
            onClick={userPromptScreenshot}
          >
            <Camera size={14} />
          </Button>
        </li>
        <li>
          <strong>Manual Video Recording 📽️</strong>
          <p>Manually record video clips as needed.</p>
          <Button className='h-6 w-6 my-2'
            variant={isRecording ? 'destructive' : 'outline'} size={'icon'}
            onClick={userPromptRecord}
          >
            <Video size={14} />
          </Button>
        </li>
        <Separator />
        <li>
          <strong>Enable/Disable Auto Record 🚫</strong>
          <p>
            Option to enable/disable automatic video recording whenever
            required.
          </p>
          <Button className='h-6 w-6 my-2'
            variant={autoRecordEnabled ? 'destructive' : 'outline'}
            size={'icon'}
            onClick={toggleAutoRecord}
          >
            {autoRecordEnabled ? <Rings color='white' height={30} /> : <PersonStanding size={14} />}

          </Button>
        </li>

        <li>
          <strong>Volume Slider 🔊</strong>
          <p>Adjust the volume level of the notifications.</p>
        </li>
        <li>
          <strong>Camera Feed Highlighting 🎨</strong>
          <p>
            Highlights persons in{" "}
            <span style={{ color: "#FF0F0F" }}>red</span> and other objects in{" "}
            <span style={{ color: "#00B612" }}>green</span>.
          </p>
        </li>
        <Separator />
        <li className="space-y-4">
          <strong>Share your thoughts 💬 </strong>
          <SocialMediaLinks/>
          <br />
          <br />
          <br />
        </li>
      </ul>
    </div>
  }
  

  return (
    <div className='flex h-screen'>
      {/* left devision for webcam */}
      <div className='relative'>
        <div className="relative h-screen w-full">
          <Webcam ref={webcamRef}
            mirrored = {mirrored}
            className='h-full w-full object-contain p-2'
          />

          <canvas ref={canvasRef}
          className='absolute top-0 left-0 h-full w-full object-contain'
          ></canvas>
          
        </div>
      </div>
      {/* right devision - container for button and wiki section */}

      <div className='flex flex-row flex-1'>
          <div className='border-primary/5 border-2 max-w-xs flex flex-col gap-2 
          justify-between shadow-md rounded-md p-4'>
            <div className="flex flex-col gap-2">
              <ModeToggle/>
              <Button
              variant={'outline'} size={'icon'}
              >
                <FlipHorizontal onClick={()=>{
                  setMirrored((prev)=>!prev)
                }}/>
              </Button>
              <Separator className='my-2'/>

            </div>
            <div className="flex flex-col gap-2">
              <Separator className='my-2'/>

                <Button
                variant={'outline'} size={'icon'}
                onClick={userPromptScreenshot}
                >
                  <Camera/>
                </Button>

                <Button variant={isRecording? 'destructive' : 'outline'} size={'icon'}
                onClick={userPromptRecord}
                >
                  <Video/>
                </Button>
              <Separator className='my-2'/>

              <Button variant={autoRecordEnabled ? 'destructive' :'outline'} size={'icon'}
              onClick={toggleAutoRecord}
              >
                {autoRecordEnabled ? <Rings color='white' height={45}/> : <PersonStanding/>}
              </Button>
            </div>
            <div className="flex flex-col gap-2">

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={'outline'} size={'icon'}>
                    <Volume2/>
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Slider max={1} min={0} step={0.1} defaultValue={[volume]}
                  onValueCommit={(val)=>{
                    setVolume(val[0]);
                    beep(val[0])
                  }}
                  /> 
                  
                </PopoverContent>
              </Popover>
              <Separator className='my-2'/>
            </div>
          </div>

          <div className='h-full flex-1 py-4 px-2 overflow-y-scroll'>
            <RenderFeatureHighlightsSection/>
          </div>
      </div>
      {loading && <div className='z-50 absolute w-full h-full flex items-center justify-center bg-primary-foreground'>
                  Getting things ready . . . <Rings height={50} color='red'/>
      </div>}
    </div>
  )
}

export default HomePage

function resizeCanvas(canvasRef: React.RefObject<HTMLCanvasElement>, webcamRef: React.RefObject<Webcam>) {
  const canvas = canvasRef.current;
  const video = webcamRef.current?.video;

  if((canvas && video)){
    const {videoWidth, videoHeight} = video;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
  }
}


function formatDate(d: Date){
  const formattedDate = 
  [
     (d.getMonth() +1).toString().padStart(2, "0"),
     d.getDate().toString().padStart(2, "0"),
     d.getFullYear(),
  ]
  .join("-") +
  " " +
  [
    d.getHours().toString().padStart(2, "0"),
    d.getMinutes().toString().padStart(2, "0"),
    d.getSeconds().toString().padStart(2, "0"),
  ]

  return formattedDate;
}

function convertBase64ToBlob(base64Image: any) {
  const decodedData = window.atob(base64Image.split(",")[1]);
  

  // Create UNIT8ARRAY of size same as row data length
  const arrayBuffer = new ArrayBuffer(decodedData.length);
  const byteArray = new Uint8Array(arrayBuffer);
  // Insert all character code into uInt8Array
  for (let i = 0; i < decodedData.length; ++i) {
    byteArray[i] = decodedData.charCodeAt(i);
  }

  // Return BLOB image after conversion
  return new Blob([arrayBuffer], { type: "image/png" });
}