'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardPenIcon, FlagIcon, Loader2, LucideLaptop2, MicIcon, PauseIcon, PhoneIcon, PlayIcon, PlusIcon, RectangleHorizontalIcon, Smartphone, SmartphoneIcon, SquareActivity, SquareDot, SquareIcon, VideoIcon, WandIcon } from 'lucide-react';
import axios from 'axios';
import { voices } from '@/lib/constants';
import { Label } from '@radix-ui/react-label';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import AudioUpload from './audio-upload';
import { errorToast, successToast } from '@/providers/custom_toast';
import { useRouter } from 'next/navigation';
import { useWorkspaceContext } from '@/providers/WorkspaceContext';


interface Voice {
  voice_id: string;
  name: string;
  labels: {
    'use case': string;
    accent: string;
    description: string;
    age: string;
    gender: string;
  };
  preview_url: string;
}
const tabs: { [key: string]: number } = {
  script: 1,
  voice: 2,
  editing: 3
};

export function NewProjectDialog({userId}: {userId: string|null}) {
  const router = useRouter()
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('script');
  const [prompt, setPrompt] = useState<string>('');
  const [script, setScript] = useState<string>('');
  const [charecterCount, setcharecterCount] = useState<number>(0);
  const [isGenerating, setIsGenrating] = useState<boolean>(false);
  const [promptType, setPromptType] = useState<string>('prompt');

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const [selectedVoiceId, setselectedVoiceId] = useState<string | null>(null);

  const [timeLimit, setTimeLimit] = useState<number>(2.5)
  const [hasTransition, setHasTransition] = useState(true)
  const [hasSoundEffects, setHasSoundEffects] = useState(true)
  const [removeSilence, setRemoveSilence] = useState(true)
  const [hasAnimatedFootage, setHasAnimatedFootage] = useState(true)
  const [aspectRatio, setAspectRatio] = useState<string>("9:16")
  const [creating, setCreating] = useState<boolean>(false);

  const {setProjectId} = useWorkspaceContext();
  
  const handlePlayPause = (voiceId: string) => {
    const currentAudio = audioRefs.current[voiceId];
    if (playingVoiceId && playingVoiceId !== voiceId) {
      const currentlyPlayingAudio = audioRefs.current[playingVoiceId];
      if (currentlyPlayingAudio) {
        currentlyPlayingAudio.pause();
        currentlyPlayingAudio.currentTime = 0;
      }
      setPlayingVoiceId(null);
    }
    if (currentAudio) {
      if (currentAudio.paused) {
        currentAudio.play();
        setPlayingVoiceId(voiceId);
      } else {
        currentAudio.pause();
        setPlayingVoiceId(null);
      }
    } else {
      const newAudio = new Audio(voices.find((v) => v.voice_id === voiceId)?.preview_url);
      newAudio.addEventListener('ended', () => setPlayingVoiceId(null));
      audioRefs.current[voiceId] = newAudio;
      newAudio.play();
      setPlayingVoiceId(voiceId);
    }
  };

  const handleNextClick = () => {
    if (activeTab === 'script' && (script.trim()!=='' || audioUrl!==null)) { // 
      if(promptType==='audio')
        setActiveTab('editing');
      else
        setActiveTab('voice');
    } else if (activeTab === 'voice' && selectedVoiceId!==null) {
      setActiveTab('editing');
    } else {
      if(promptType==='prompt' && script.trim()==='')
        errorToast('Script is Empty. Create Script First.')
      else if(promptType==='audio' && audioUrl===null)
        errorToast('Select The Audio First')
      else if(activeTab === 'voice' && selectedVoiceId===null)
        errorToast('Select The Voice To be Used')
    }
  };

  const handleSubmit = async () => {
    const data = {
      userId,
      promt_type: promptType,
      prompt : prompt,
      script : script,
      audio_url : audioUrl,
      voices_id: selectedVoiceId,
      time_limit: timeLimit,
      has_transition: hasTransition,
      has_sound_effects: hasSoundEffects,
      remove_silence: removeSilence,
      has_animated_footage: hasAnimatedFootage,
      aspect_ratio: aspectRatio
    }
    setCreating(true)
    try {
      const response = await axios.post('/api/createProject', {data:data}, {
        headers: {'Content-Type': 'application/json'}
      })
      if (response.status === 200) {
        console.log(response.data)
        setOpen(false)
        router.push(`/workspace/`)
        successToast("Project Successfull added to Queue.")
        setProjectId(response.data.id)
      } else {
        errorToast('Failed to generate Video. Try again Later!');
      }

    } catch (error) {
      console.error(error);
      errorToast('Failed to Create Video. Try again.', JSON.stringify(error));
    } finally {
      setCreating(false)
    }
  }

  const generateScript = async () => {
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt === '') {
      errorToast('Prompt is Empty. Try Again!', "Use non empty prompts like 'Future of Education'");
      return;
    }
    setIsGenrating(true);
    try {
      const response = await axios.post('/api/generateScript', { prompt: trimmedPrompt }, {
        headers: {'Content-Type': 'application/json'}
      });
      if (response.status === 200) {
        var text = response.data.script
        setcharecterCount(text.length)
        setScript(text);
      } else {
        errorToast('Failed to generate script. Try again Later!');
      }
    } catch (error) {
      console.error(error);
      errorToast('Failed to generate script.', 'Try checking your internet connection.');
    } finally {
      setIsGenrating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={()=>setOpen(true)} variant="outline">
          <PlusIcon className="mr-2 h-4 w-4" />
          Create New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Video Creation Form</DialogTitle>
        </DialogHeader>
        <DialogDescription>
        <div className="grid gap-4 py-4">
          <Tabs defaultValue="script" value={activeTab} onValueChange={(value:string)=>{if(promptType==='audio' && value==='voice')return;if(tabs[value]<tabs[activeTab]) setActiveTab(value)}}>
            <TabsList className="flex justify-between">
              <TabsTrigger value="script" className="flex items-center space-x-2">
                <VideoIcon className="h-5 w-5" />
                <span>Script</span>
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center space-x-2">
                <MicIcon className="h-5 w-5" />
                <span>Voice</span>
              </TabsTrigger>
              <TabsTrigger value="editing" className="flex items-center space-x-2">
                <ClipboardPenIcon className="h-5 w-5" />
                <span>Editing</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="script" className='max-h-[340px] h-[340px]'>
              <Tabs defaultValue={promptType} className="w-full" onValueChange={(val:string)=>setPromptType(val)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="prompt">Prompt</TabsTrigger>
                  <TabsTrigger value="audio">Audio</TabsTrigger>
                </TabsList>
                <TabsContent value="prompt">
                  {/* { Story Generation from prompt } */}
                  <div className="flex items-center space-x-2 mt-4">
                    <FlagIcon className="h-5 w-5" />
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      type="text"
                      placeholder="Your video idea..."
                      className="flex-1"
                    />
                    <Button onClick={generateScript} variant="default" className="flex items-center space-x-2" disabled={isGenerating}>
                      {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> :
                      <WandIcon className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} /> }
                      <span>Generate</span>
                    </Button>
                  </div>
                  <Textarea placeholder="Your script will appear here..." value={script} onChange={e=>setScript(e.target.value)} className="mt-4 h-48" />
                  {charecterCount<100?(
                    <p className="text-sm text-muted-foreground mt-2">100 characters required ({charecterCount}/100)</p>
                  ):
                  <p className="text-sm text-muted-foreground mt-2">{charecterCount} charecters</p>
                  }
                </TabsContent>
                <TabsContent value="audio">
                  <AudioUpload audioUrl={audioUrl} setAudioUrl={setAudioUrl} isUploading={isUploading} setIsUploading={setIsUploading} />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="voice" className='max-h-[340px] h-[340px] overflow-y-scroll'>
            <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                  {voices.map((voice) => {
                    const voiceId = voice.voice_id;
                    return (
                      <tr key={voiceId} className={"border-b border-muted items-center" + (voiceId === selectedVoiceId ? ' bg-muted' : '')}>
                        <td className="px-4 py-3">
                          {voice.name}
                          <div className='flex gap-3 text-sm text-nowrap'>
                            <span className='px-2 py-0.5 bg-emerald-300 border rounded-2xl'>{voice.labels.accent}</span>
                            <span className='px-2 py-0.5 bg-orange-400 border rounded-2xl'>{voice.labels.gender}</span>
                            <span className='px-2 py-0.5 bg-violet-300 border rounded-2xl'>{voice.labels.age}</span>
                            <span className='px-2 py-0.5 bg-red-400 border rounded-2xl'>{voice.labels.description}</span>
                          </div>
                        </td>
                        <td className='text-center'>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePlayPause(voiceId)}
                          >
                            {playingVoiceId === voiceId ? (
                              <PauseIcon className="h-5 w-5" />
                            ) : (
                              <PlayIcon className="h-5 w-5 " />
                              
                            )}
                            <span className="sr-only">Play/Pause</span>
                          </Button>
                        </td>
                        <td className="px-1 py-2 text-center dark:text-zinc-300">
                          <Button variant="outline" onClick={() => setselectedVoiceId(voiceId)} >Use</Button>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="editing" className='h-[340px] overflow-y-scroll'>
            <div className="grid gap-4">
                <div className=" py-2">
                  <Label htmlFor="time-limit">
                    <p className="text-sm text-muted-foreground py-2"> time limit for each footage : {timeLimit} seconds.</p>
                  </Label>
                  <Slider id="time-limit" min={2} max={5} step={0.5} defaultValue={[timeLimit]} onValueChange={(value)=>setTimeLimit(value[0])}/>
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="aspect-ratio">
                    <h1>Select Aspect Ratio <span className=' border-x-2 p-1 rounded text-green-600'>{aspectRatio}</span></h1>
                    <p className="text-sm font-light text-muted-foreground">
                      Select the desired aspect ratio for your video.
                    </p>
                  </Label>
                  <div className="flex items-center gap-2">
                    <RadioGroup id="aspect-ratio" value={aspectRatio} onValueChange={setAspectRatio}
                      className="flex items-center w-full justify-between gap-2"
                    >
                      <Label htmlFor="16:9" className={`border cursor-pointer rounded-md p-2 flex items-center gap-2 ${aspectRatio === '16:9' ? 'bg-muted' : ''}`}>
                        <RadioGroupItem id="16:9" value="16:9" className='hidden'/>
                        <LucideLaptop2 className="h-5 w-5" />
                      </Label>
                      <Label htmlFor="9:16" className={`border cursor-pointer rounded-md p-2 flex items-center gap-2 ${aspectRatio === '9:16' ? 'bg-muted' : ''}`}>
                        <RadioGroupItem id="9:16" value="9:16" className='hidden'/>
                        <SmartphoneIcon className="h-5 w-5" />
                      </Label>
                      <Label htmlFor="1:1" className={`border cursor-pointer rounded-md p-2 flex items-center gap-2 ${aspectRatio === '1:1' ? 'bg-muted' : ''}`}>
                        <RadioGroupItem id="1:1" value="1:1" className='hidden'/>
                        <SquareDot className="h-5 w-5" />
                      </Label>
                    </RadioGroup>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="transition">
                    <h1>Transition</h1>
                    <p className="text-sm font-light text-muted-foreground">
                      Enable or disable transitions between video clips.
                    </p>
                  </Label>
                  <Switch id="transition" aria-label="Transition"
                    checked={hasTransition}
                    onCheckedChange={setHasTransition}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="sound-effects">
                    <h1>Sound Effects</h1>
                    <p className="text-sm font-light text-muted-foreground">
                      Add or remove sound effects to the video.
                    </p>
                  </Label>
                  <Switch
                    id="sound-effects"
                    aria-label="Sound Effects"
                    checked={hasSoundEffects}
                    onCheckedChange={setHasSoundEffects}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="remove-silence">
                    <h1>Remove Silence</h1>
                    <p className="text-sm font-light text-muted-foreground">
                      Automatically remove any silent periods in the audio.
                    </p>
                  </Label>
                  <Switch
                    id="remove-silence"
                    aria-label="Remove Silence"
                    checked={removeSilence}
                    onCheckedChange={setRemoveSilence}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="animated-footage">
                    <h1>Animated Footage</h1>
                    <p className="text-sm font-light text-muted-foreground">
                      Include animated elements or graphics in the video.
                    </p>
                  </Label>
                  <Switch
                    id="animated-footage"
                    aria-label="Animated Footage"
                    checked={hasAnimatedFootage}
                    onCheckedChange={setHasAnimatedFootage}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        </DialogDescription>
        <DialogFooter className="flex justify-between">
          {activeTab === 'editing' ? (
            <div className='flex items-center'>
              {creating && <Loader2 className="mr-2 h-6 w-6 animate-spin" /> }
              <Button onClick={handleSubmit} disabled={creating}>Create</Button>
            </div>
          ) : (
            <Button onClick={handleNextClick} disabled={isUploading || isGenerating}>Next</Button>
          )}
        </DialogFooter> 
      </DialogContent>
    </Dialog>
  );
}
