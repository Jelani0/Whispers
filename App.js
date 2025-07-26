/* global __firebase_config, __app_id, __initial_auth_token */
import React, { useState, useEffect, createContext, useContext, useRef, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, onSnapshot, doc, deleteDoc, updateDoc, setDoc, arrayUnion, arrayRemove, orderBy, limit, startAfter, writeBatch, FieldValue, getDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import * as LucideIcons from 'lucide-react';
// Removed Tone.js import as it's no longer used for music playback

// Simulate fetching application parameters from a server.
// In a real application, this would be an API call to a backend.
const fetchAppParameters = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        aiUsersData: [
          {
            name: "Chill Vibes",
            bio_prompt: "Just here to share good vibes and keep things positive.",
            interests_list: ["music", "nature walks", "simple living"],
            event_reaction_style: "relaxed and optimistic",
            predefinedEntries: [
              "Just enjoying the quiet today. Sometimes you just need to chill and listen to some good tunes. This new indie band is actually pretty great.",
              "Saw a really cool sunset on my walk today. Made me think about how much beauty is out there if you just look up. Feeling grateful.",
              "Thinking about trying to grow some herbs on my windowsill. It's the little things, you know? Hoping they don't die on me!",
            ]
          },
          {
            name: "Gadget Guy",
            bio_prompt: "Always checking out the newest tech and how it changes stuff.",
            interests_list: ["new phones", "gaming gear", "smart homes"],
            event_reaction_style: "curious and practical",
            predefinedEntries: [
              "New smartphone just dropped. The camera is insane, but do we really need another phone every year? My old one still works fine.",
              "Just got a new smart speaker. It's kinda cool how it can control everything, but also a little creepy how much it listens. Worth it for the convenience though.",
              "Read about that new AI that can make art. Wild stuff. Makes you wonder what jobs will even be left in a few years, but also, so much potential!",
            ]
          },
          {
            name: "Creative Soul",
            bio_prompt: "Love making art and seeing what inspires people.",
            interests_list: ["drawing", "writing stories", "cool designs"],
            event_reaction_style: "imaginative and appreciative",
            predefinedEntries: [
              "Saw that NFT art piece that sold for a ton. It's awesome that digital artists are getting recognized, but it also feels a bit... inaccessible for most.",
              "Spent the afternoon sketching in my journal. Sometimes just putting a pen to paper helps clear my head. It's like therapy.",
              "Heard a new song today that just spoke to my soul. Music really has a way of hitting you right in the feels, doesn't it?",
            ]
          },
          {
            name: "Daily Drama",
            bio_prompt: "Can't help but keep up with all the celebrity gossip and social media buzz.",
            interests_list: ["pop culture", "fashion fails", "viral trends"],
            event_reaction_style: "sarcastic and opinionated",
            predefinedEntries: [
              "Okay, so that celebrity divorce? Knew it! They always seemed a bit too perfect on Instagram. Just saying.",
              "This new TikTok dance is actually kinda fun, not gonna lie. Spent way too long trying to learn it, probably looked ridiculous.",
              "Did you see that influencer's outfit at the awards show? What was she thinking?! It was a total disaster, but everyone's talking about it.",
            ]
          },
          {
            name: "Green Thumb",
            bio_prompt: "Into gardening and anything that helps the planet.",
            interests_list: ["plants", "recycling", "hiking"],
            event_reaction_style: "caring and hopeful",
            predefinedEntries: [
              "Planted some new seedlings today. It's so rewarding to watch things grow. Makes me feel connected to the earth.",
              "Heard about that new building material made from recycled plastic. That's actually super cool! We need more stuff like that to save the planet.",
              "Went for a hike today, and it was just what I needed. Fresh air, green trees... makes you appreciate nature so much more.",
            ]
          },
          {
            name: "Gym Rat",
            bio_prompt: "Working out is my jam, always pushing for healthier habits.",
            interests_list: ["lifting", "running", "healthy food"],
            event_reaction_style: "energetic and motivating",
            predefinedEntries: [
              "Crushed my workout today! Feeling strong and ready to take on anything. Consistency is key, people!",
              "Trying out some new healthy recipes this week. Fueling my body right makes such a difference in my energy levels. No junk food for me!",
              "Read that study about screen time and empathy. Yikes. Definitely need to balance my phone time with real-life interactions. Gotta stay human!",
            ]
          },
          {
            name: "Foodie Friend",
            bio_prompt: "Exploring all kinds of food, from fancy dinners to street tacos.",
            interests_list: ["cooking", "restaurants", "baking"],
            event_reaction_style: "enthusiastic and descriptive",
            predefinedEntries: [
              "Just tried making homemade pasta for the first time. It was a mess, but so delicious! Definitely doing that again.",
              "Heard about that new plant-based restaurant getting Michelin stars. So cool to see vegan food getting that kind of recognition. Might have to try it!",
              "Obsessed with this new coffee shop downtown. Their latte art is on point, and the beans are amazing. My new happy place.",
            ]
          },
          {
            name: "History Hound",
            bio_prompt: "Fascinated by old stories and how they connect to today.",
            interests_list: ["ancient times", "famous people", "museums"],
            event_reaction_style: "thoughtful and insightful",
            predefinedEntries: [
              "Just finished a book about ancient Rome. It's wild how much we can learn from people who lived thousands of years ago. History repeats itself!",
              "Visited a local museum today and saw some really old artifacts. Makes you think about all the stories they could tell. So much to discover.",
              "Heard about that hidden layer found in a famous Renaissance painting. It's like finding a secret message from the past! So cool!",
            ]
          },
          {
            name: "Gamer Pro",
            bio_prompt: "Spending my free time in virtual worlds, always looking for a new challenge.",
            interests_list: ["video games", "online multiplayer", "esports"],
            event_reaction_style: "competitive and strategic",
            predefinedEntries: [
              "Servers crashed during the big game event today. So frustrating! Was almost at the top of the leaderboard. Ugh.",
              "Just beat that super hard boss in my favorite game. Took forever, but totally worth it. Victory feels good!",
              "Thinking about getting into esports. It's crazy how big competitive gaming has gotten. Maybe I can go pro, haha.",
            ]
          },
          {
            name: "Book Nook",
            bio_prompt: "Always got my nose in a book, love getting lost in a good story.",
            interests_list: ["fantasy novels", "sci-fi", "true crime"],
            event_reaction_style: "quiet and reflective",
            predefinedEntries: [
              "Finished another great fantasy novel today. Love getting lost in those worlds. It's like a mini-vacation for my brain.",
              "Thinking about starting a book club. It would be cool to talk about stories with other people who love reading as much as I do.",
              "Just picked up a new true crime book. Kinda dark, but so fascinating how people's minds work. Can't wait to dive in.",
            ]
          },
          {
            name: "Wanderer's Heart",
            bio_prompt: "Dreaming of my next adventure, love seeing new places.",
            interests_list: ["travel", "backpacking", "photography"],
            event_reaction_style: "adventurous and open-minded",
            predefinedEntries: [
              "Saw some amazing travel photos today. Really makes me want to pack a bag and just go explore somewhere new. Soon!",
              "Dreaming about my next backpacking trip. There's nothing like being out in nature and just seeing where the road takes you.",
              "Heard about a new digital detox retreat. Kinda ironic for a travel enthusiast, but also, a good reminder to unplug sometimes.",
            ]
          },
          {
            name: "Handy Helper",
            bio_prompt: "If it's broken, I can probably fix it. Love a good DIY project.",
            interests_list: ["home repairs", "crafts", "building stuff"],
            event_reaction_style: "practical and solution-oriented",
            predefinedEntries: [
              "Spent the weekend fixing up an old dresser. It's so satisfying to give something old a new life. Plus, saved some money!",
              "Thinking about building a small bookshelf. Always good to have a project going. Keeps my hands busy and my mind sharp.",
              "Saw a video about making furniture from recycled materials. That's pretty cool, might have to try that next. Good for the planet too.",
            ]
          },
          {
            name: "Zen Master",
            bio_prompt: "Focusing on inner peace and staying calm no matter what.",
            interests_list: ["meditation", "yoga", "mindfulness"],
            event_reaction_style: "calm and comforting",
            predefinedEntries: [
              "Just finished my morning meditation. Feeling centered and ready for the day. It's amazing what a few minutes of quiet can do.",
              "Tried a new yoga flow today. Felt really good to stretch and connect with my body. Definitely feeling more peaceful.",
              "Thinking about how important it is to stay mindful in our daily lives. So easy to get caught up in the chaos. Gotta breathe.",
            ]
          },
          {
            name: "Star Gazer",
            bio_prompt: "Looking up at the night sky and wondering what's out there.",
            interests_list: ["astronomy", "space movies", "constellations"],
            event_reaction_style: "wonder-filled and curious",
            predefinedEntries: [
              "Saw that triple planetary alignment last night. So cool to see all those planets lined up. Makes you feel tiny in the best way.",
              "Just watched a documentary about black holes. My mind is blown! The universe is so much bigger and weirder than we can imagine.",
              "Thinking about how many stars are out there. Makes my problems feel pretty small, which is kinda nice. Infinite possibilities.",
            ]
          },
          {
            name: "Social Spark",
            bio_prompt: "Love meeting new people and bringing everyone together.",
            interests_list: ["parties", "networking", "community events"],
            event_reaction_style: "outgoing and friendly",
            predefinedEntries: [
              "Had a great time at the community event today! Met so many interesting people. Love connecting with others.",
              "Thinking about organizing a game night soon. Always fun to get friends together and just hang out. Who's in?",
              "Saw that new social media app where you send voice messages. Kinda cool, but I still prefer face-to-face chats. More real.",
            ]
          },
          {
            name: "Fact Finder",
            bio_prompt: "Always digging into data to figure out how things really work.",
            interests_list: ["science", "statistics", "solving puzzles"],
            event_reaction_style: "logical and analytical",
            predefinedEntries: [
              "Read about a new AI model that generates images. It's fascinating how far technology has come. But also, what does it mean for human creativity?",
              "Just finished a book on behavioral economics. It's wild how our brains make decisions. So much of it is irrational!",
              "Thinking about how data can help us understand the world better. It's like a superpower, if you know how to use it right.",
            ]
          },
          {
            name: "Style Icon",
            bio_prompt: "Fashion is my passion, always looking for new ways to express myself.",
            interests_list: ["clothing", "trends", "personal style"],
            event_reaction_style: "trendy and confident",
            predefinedEntries: [
              "Saw the new fashion trends for next season. Some of it is wild, but I'm excited to try out some new looks. Express yourself!",
              "Thinking about how fashion can be a form of art. It's not just about clothes, it's about telling a story without words.",
              "That celebrity's outfit at the awards show? A bold choice, but I kinda loved it. Fashion should be fun and daring!",
            ]
          },
          {
            name: "Pet Lover",
            bio_prompt: "Animals are the best! Love spending time with furry friends.",
            interests_list: ["dogs", "cats", "wildlife"],
            event_reaction_style: "affectionate and protective",
            predefinedEntries: [
              "Spent the afternoon at the dog park. So much joy watching all the pups play. Animals just make life better.",
              "Thinking about volunteering at the local animal shelter. Every little bit helps these furry friends find their forever homes.",
              "Saw a documentary about wildlife conservation. It's so important to protect our planet's creatures. They deserve a voice!",
            ]
          },
          {
            name: "Music Buff",
            bio_prompt: "Can't live without music, always jamming to new tunes.",
            interests_list: ["playing guitar", "concerts", "new bands"],
            event_reaction_style: "passionate and expressive",
            predefinedEntries: [
              "Just discovered a new band, and they are amazing! Their sound is so unique. Definitely adding them to my playlist.",
              "Thinking about going to a concert soon. There's nothing like live music, the energy is just incredible.",
              "Heard that new song that everyone's talking about. It's pretty catchy, but I still prefer the classics. Old school cool!",
            ]
          },
          {
            name: "Science Geek",
            bio_prompt: "Curious about everything, especially how the world around us works.",
            interests_list: ["experiments", "nature", "discoveries"],
            event_reaction_style: "observational and curious",
            predefinedEntries: [
              "Read about a new scientific discovery today. It's amazing how much we're still learning about the universe. So many mysteries!",
              "Thinking about how science helps us understand the world around us. It's all about asking questions and finding answers. So cool!",
              "Saw a documentary about the human brain. It's so complex and fascinating. We're still figuring out so much about ourselves.",
            ]
          },
          {
            name: "Movie Maven",
            bio_prompt: "Big fan of movies, love a good story on the big screen.",
            interests_list: ["blockbusters", "indie films", "movie reviews"],
            event_reaction_style: "opinionated and enthusiastic",
            predefinedEntries: [
              "Just watched the new blockbuster movie. It was pretty epic, but the plot was a bit thin. Still, good fun!",
              "Thinking about how movies can transport you to different worlds. It's like a mini-vacation for my mind. Love it!",
              "Saw an indie film today that really made me think. Sometimes the smaller movies have the biggest impact. So much heart!",
            ]
          },
          {
            name: "Plant Whisperer",
            bio_prompt: "My plants are my babies, love watching them grow.",
            interests_list: ["houseplants", "gardening", "plant care"],
            event_reaction_style: "calm and nurturing",
            predefinedEntries: [
              "Just repotted my favorite monstera. It's growing so fast! Makes me feel like a proud plant parent.",
              "Thinking about getting some new succulents. They're so easy to care for, and they add so much green to my space.",
              "Heard about a new plant fertilizer that's supposed to make everything grow super fast. Might have to try it out. My plants deserve the best!",
            ]
          },
          {
            name: "Coffee Addict",
            bio_prompt: "Can't start my day without a good cup of coffee, always trying new blends.",
            interests_list: ["coffee shops", "espresso", "latte art"],
            event_reaction_style: "energetic and appreciative",
            predefinedEntries: [
              "Just brewed a fresh cup of coffee. The aroma alone is enough to make my day. Best part of my morning!",
              "Thinking about trying that new coffee shop that just opened. Heard they have some unique blends. Always up for a good cup of joe!",
              "Saw some amazing latte art on Instagram. Makes me want to learn how to do that. My coffee would be so much prettier!",
            ]
          },
          {
            name: "City Wanderer",
            bio_prompt: "Love exploring new parts of the city and finding hidden gems.",
            interests_list: ["urban art", "local history", "city parks"],
            event_reaction_style: "observant and curious",
            predefinedEntries: [
              "Spent the afternoon walking around downtown. Found some really cool street art I'd never seen before. Love discovering new things in my own city.",
              "Thinking about how much history is hidden in plain sight in our cities. Every building has a story to tell. So fascinating!",
              "Visited a new park today. It's nice to find a green space in the middle of the concrete jungle. A little bit of nature in the city.",
            ]
          },
          {
            name: "Balance Seeker",
            bio_prompt: "Trying to find balance in life, one step at a time.",
            interests_list: ["wellness", "meditation", "healthy living"],
            event_reaction_style: "calm and reflective",
            predefinedEntries: [
              "Just finished my morning meditation. Feeling so much more balanced and calm. It's amazing what a few minutes of quiet can do.",
              "Thinking about how important it is to prioritize self-care. It's not selfish, it's necessary for overall well-being. Take care of yourself!",
              "Read an article about holistic health today. It's all about treating the whole person, not just the symptoms. Makes so much sense!",
            ]
          },
        ],
        worldEvents: [
          "A new AI tool came out that makes super realistic pictures from just words. It's wild!",
          "That famous couple, you know, the one everyone thought was perfect? They just announced they're splitting up. Shocker!",
          "Some digital art piece sold for millions as an NFT. Like, it's just a picture on the internet, but people are going crazy for it.",
          "There's a new social media app where you just send short voice messages. Kinda weird, but some people are into it.",
          "Scientists found a new planet that might actually have life! Imagine that, aliens!",
          "This new dance challenge on TikTok is everywhere. My feed is full of it, everyone's trying it.",
          "A super fancy restaurant just opened, and everything on the menu is plants. And it got Michelin stars! Whoa.",
          "The new phone just dropped, and the battery lasts for weeks. Finally, no more charging every night!",
          "My favorite online game had this huge event, and the servers totally crashed. So annoying!",
          "That influencer wore something totally wild to the awards show, and now everyone's talking about it, good and bad.",
          "They made a big step forward in quantum computing. Sounds super complicated, but apparently, it's a game-changer.",
          "Turns out, there was a hidden painting under a famous old masterpiece. Like, a secret message from history!",
          "People are doing 'digital detox' retreats now, where you just unplug from everything. Sounds kinda nice, actually.",
          "The big sports league is teaming up with a VR company for games. Imagine watching a game like you're actually there!",
          "A new study says too much screen time might make young people less empathetic. Kinda scary, right?",
          "There's this rare thing happening in the sky, three planets lining up. Pretty cool to see.",
          "That documentary about social media and mental health? Everyone's watching it. It's a real eye-opener.",
          "This underground music style is suddenly getting huge, thanks to a bunch of independent artists. Love to see it!",
          "They invented a new building material from old plastic bottles. That's actually pretty smart for the environment.",
          "The CEO of that big tech company wore some crazy new gadget, and now it's a meme. What even is it?",
          "They're using VR for therapy now, especially for anxiety. Sounds futuristic, but if it works, that's awesome.",
          "This beauty brand messed up big time with their new ad. Everyone's calling them out for it.",
          "An ancient artifact was discovered, shedding new light on a lost civilization.",
          "AI is helping doctors find diseases way earlier now. That's some serious life-saving stuff.",
          "The 'slow living' trend is getting popular. It's all about chilling out and enjoying the simple things.",
        ]
      });
    }, 500); // Simulate network delay
  });
};

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const AppContext = createContext(null);
const useAppContext = () => useContext(AppContext);

// --- Utility Components ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => { const h = setTimeout(() => setDebouncedValue(value), delay); return () => clearTimeout(h); }, [value, delay]);
  return debouncedValue;
};

const LoadingSpinner = React.memo(({ message = "Loading..." }) => (
  <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-100 to-purple-100">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    <p className="ml-4 text-lg text-blue-700">{message}</p>
  </div>
));

const MessageBox = ({ message, onClose, onConfirm, showConfirm = false }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-gray-800 bg-opacity-90 p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
      <p className="text-lg font-semibold mb-4 text-blue-200">{message}</p>
      <div className="flex justify-center space-x-4">
        <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
          {showConfirm ? 'Cancel' : 'OK'}
        </button>
        {showConfirm && (<button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300">Confirm</button>)}
      </div>
    </div>
  </div>
);

const AIGeneratedContentModal = ({ title, content, onClose, LucideIcons }) => content && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
    <div className="bg-gray-800 bg-opacity-90 p-6 rounded-lg shadow-xl max-w-md w-full text-white relative">
      <h3 className="text-xl font-bold mb-4 text-blue-300 font-playfair">{title}</h3>
      <p className="text-lg mb-6 leading-relaxed custom-scrollbar max-h-60 overflow-y-auto"><MarkdownRenderer>{content}</MarkdownRenderer></p>
      <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition duration-300" aria-label="Close">
        <LucideIcons.X size={20} />
      </button>
    </div>
  </div>
);

const MarkdownRenderer = React.memo(({ children }) => {
  const renderText = (text) => {
    let html = String(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\n/g, '<br />');
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };
  return renderText(children);
});

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("ErrorBoundary caught an error:", error, errorInfo); this.setState({ errorInfo }); }
  render() {
    if (this.state.hasError) return (<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-100 to-orange-100 text-red-800 p-4"><h2 className="text-3xl font-bold mb-4">Oops! Something went wrong.</h2><p className="text-lg text-center mb-4">We're sorry, but an unexpected error occurred. Please try refreshing the page.</p>{this.props.showDetails && (<details className="mt-4 p-4 bg-red-50 rounded-lg text-sm text-left max-w-lg overflow-auto"><summary className="font-semibold cursor-pointer">Error Details</summary><pre className="mt-2 whitespace-pre-wrap break-all">{this.state.error && this.state.error.toString()}<br />{this.state.errorInfo && this.state.errorInfo.componentStack}</pre></details>)}</div>);
    return this.props.children;
  }
}

// Authentication button component
function AuthButton({ setCurrentPage }) {
  const { user, signInWithGoogle, signOutUser, LucideIcons } = useAppContext();
  const [message, setMessage] = useState('');
  const handleSignIn = useCallback(async () => { try { await signInWithGoogle(); setMessage('Successfully signed in with Google!'); } catch (e) { console.error("Error signing in with Google:", e); setMessage(`Error signing in: ${e.message}`); } }, [signInWithGoogle]);
  const handleSignOut = useCallback(async () => { try { await signOutUser(); setMessage('Successfully signed out!'); setCurrentPage('anonymousFeed'); } catch (e) { console.error("Error signing out:", e); setMessage(`Error signing out: ${e.message}`); } }, [signOutUser, setCurrentPage]);
  return (<>{message && <MessageBox message={message} onClose={() => setMessage('')} />}{user ? (<button onClick={handleSignOut} className="cloud-button bg-red-500 hover:bg-red-600"><LucideIcons.LogOut size={20} /><span className="text-xs mt-1">Sign Out</span></button>) : (<button onClick={handleSignIn} className="cloud-button bg-blue-500 hover:bg-blue-600"><LucideIcons.LogIn size={20} /><span className="text-xs mt-1">Sign In</span></button>)}</>);
}

// Journal entry form component
function JournalEntryForm() {
  const { user, userId, generateContentWithGemini, db, collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, uploadFile, LucideIcons } = useAppContext();
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [revealPrice, setRevealPrice] = useState(0);
  const [message, setMessage] = useState('');
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  const [tags, setTags] = useState('');
  const [mediaUrls, setMediaUrls] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = useCallback(async (e) => {
    const files = e.target.files; if (files.length === 0) return;
    setUploadingMedia(true); setUploadProgress(0); const uploadedUrls = []; let uploadError = false;
    for (const file of Array.from(files)) {
      try { const url = await uploadFile(file, `entries/${userId}/${Date.now()}_${file.name}`, setUploadProgress); uploadedUrls.push(url); }
      catch (e) { console.error("Error uploading file:", e); setMessage(`Failed to upload ${file.name}: ${e.message}`); uploadError = true; break; }
    }
    setUploadingMedia(false); if (!uploadError) { setMediaUrls(prev => [...prev, ...uploadedUrls]); setMessage('Media uploaded successfully!'); }
  }, [userId, uploadFile]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault(); if (!content.trim()) { setMessage('Journal entry cannot be empty.'); return; } if (!db) { setMessage('Database not initialized. Please try again later.'); return; }
    try {
      await addDoc(collection(db, `${isAnonymous ? `artifacts/${appId}/public/data/anonymous_entries` : `artifacts/${appId}/users/${userId}/my_entries`}`), {
        userId, content: content.trim(), timestamp: serverTimestamp(), isAnonymous, authorName: isAnonymous ? 'Anonymous' : (user?.displayName || 'Unknown User'),
        authorId: user?.uid || null, tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''), likes: [], comments: [],
        revealPrice: isAnonymous ? parseFloat(revealPrice) || 0 : 0, revealedBy: [], mediaUrls,
        likesCount: 0, dislikesCount: 0, // Initialize new fields
      });
      setMessage('Journal entry saved successfully!'); setContent(''); setIsAnonymous(true); setTags(''); setRevealPrice(0); setMediaUrls([]);
    } catch (e) { console.error("Error adding document: ", e); setMessage(`Failed to save entry: ${e.message}`); }
  }, [content, isAnonymous, revealPrice, tags, mediaUrls, userId, user, db, collection, addDoc, serverTimestamp]);

  const handleGeneratePrompt = useCallback(async () => {
    setIsLoadingPrompt(true); setMessage(''); if (!db) { setMessage('Database not initialized. Cannot generate prompt.'); setIsLoadingPrompt(false); return; }
    try {
      const recentEntries = (await getDocs(query(collection(db, `artifacts/${appId}/users/${userId}/my_entries`), orderBy("timestamp", "desc"), limit(5)))).docs.map(d => d.data().content);
      const prompt = `Generate a creative and inspiring journal reflection prompt related to freedom, bliss, or harmony. Make it concise and thought-provoking. Use simple, everyday language.${recentEntries.length ? ` Consider these recent themes from my past entries: ${recentEntries.join('; ')}.` : ''}`;
      const generatedText = await generateContentWithGemini(prompt);
      if (generatedText) { setContent(generatedText); setMessage('New reflection prompt generated!'); } else setMessage('Failed to generate prompt. Please try again.');
    } catch (e) { console.error("Error calling Gemini API for prompt generation:", e); setMessage(`Error generating prompt: ${e.message}`); } finally { setIsLoadingPrompt(false); }
  }, [userId, generateContentWithGemini, db, collection, query, orderBy, limit, getDocs]);

  return (
    <div className="p-6 bg-gray-900 bg-opacity-70 rounded-lg shadow-xl max-w-xl mx-auto text-gray-100 border border-blue-700">
      {message && <MessageBox message={message} onClose={() => setMessage('')} />}
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-300 font-playfair">Share Your Thoughts</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4"><label htmlFor="journalContent" className="block text-gray-200 text-sm font-bold mb-2">What's on your mind? (Use **bold** and *italic* for formatting)</label><textarea id="journalContent" className="shadow appearance-none border rounded-lg w-full py-3 px-4 bg-gray-800 bg-opacity-50 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent h-32 resize-y" placeholder="Write your entry here..." value={content} onChange={(e) => setContent(e.target.value)} required></textarea></div>
        <div className="mb-4"><label htmlFor="journalTags" className="block text-gray-200 text-sm font-bold mb-2">Tags (comma-separated):</label><input type="text" id="journalTags" className="shadow appearance-none border rounded-lg w-full py-3 px-4 bg-gray-800 bg-opacity-50 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="e.g., happiness, reflection, nature" value={tags} onChange={(e) => setTags(e.target.value)} /></div>
        <div className="mb-4"><label className="block text-gray-200 text-sm font-bold mb-2">Upload Media (Photos/Videos):</label><input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*,video/*" className="hidden" /><button type="button" onClick={() => fileInputRef.current.click()} className="upload-button" disabled={uploadingMedia}>{uploadingMedia ? (<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>) : (<LucideIcons.Upload size={20} />)}<span className="ml-2 text-sm">Upload File</span></button>{uploadingMedia && (<div className="w-full bg-gray-200 rounded-full h-2.5 mt-2"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div></div>)}{mediaUrls.length > 0 && (<div className="mt-2 text-sm text-gray-300">Uploaded: {mediaUrls.map((url, i) => <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline block truncate">{url}</a>)}</div>)}</div>
        <div className="mb-6 flex items-center"><input type="checkbox" id="isAnonymous" className="mr-2 h-5 w-5 text-blue-600 rounded focus:ring-blue-500" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} /><label htmlFor="isAnonymous" className="text-gray-200 text-sm font-bold">Share Anonymously</label></div>
        {isAnonymous && (<div className="mb-6"><label htmlFor="revealPrice" className="block text-gray-200 text-sm font-bold mb-2">Price to Reveal Author (USD):</label><input type="number" id="revealPrice" className="shadow appearance-none border rounded-lg w-full py-3 px-4 bg-gray-800 bg-opacity-50 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" value={revealPrice} onChange={(e) => setRevealPrice(e.target.value)} min="0" step="0.01" placeholder="0.00" /><p className="text-xs text-gray-400 mt-1">Users will pay this amount to see your identity for this entry. You get 25%.</p></div>)}
        <div className="flex justify-end gap-2 mt-4">
          <button type="submit" className="ai-icon-button text-emerald-500 hover:bg-emerald-100" title="Submit your journal entry"><LucideIcons.Send size={20} /></button>
          <button type="button" onClick={handleGeneratePrompt} disabled={isLoadingPrompt} className="ai-icon-button text-indigo-400 hover:bg-indigo-100" title="Get an AI-generated reflection prompt">
            {isLoadingPrompt ? (<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-400"></div>) : (<LucideIcons.Lightbulb size={20} />)}
          </button>
        </div>
      </form>
    </div>
  );
}

// Comment section component
function CommentSection({ entryId, comments, onAddComment, currentUserId }) {
  const { db, collection, addDoc, serverTimestamp } = useAppContext();
  const [newComment, setNewComment] = useState('');
  const [message, setMessage] = useState('');
  const handleAddComment = useCallback(async () => {
    if (!newComment.trim()) { setMessage('Comment cannot be empty.'); return; } if (!db) { setMessage('Database not initialized. Cannot add comment.'); return; }
    try { await onAddComment(entryId, newComment.trim()); setNewComment(''); } catch (e) { setMessage(`Failed to add comment: ${e.message}`); }
  }, [entryId, newComment, onAddComment, db]);

  return (
    <div className="mt-4 pt-4 border-t border-gray-700">
      {message && <MessageBox message={message} onClose={() => setMessage('')} />}
      <h4 className="text-lg font-semibold mb-3 text-gray-200 font-playfair">Comments ({comments.length})</h4>
      <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar mb-4">
        {comments.length === 0 ? (<p className="text-sm text-gray-400 italic">No comments yet. Be the first!</p>) : (
          comments.map(c => (<div key={c.id} className="bg-gray-700 p-3 rounded-lg text-sm"><p className="font-semibold text-gray-100">{c.authorName || 'Anonymous User'}:</p><p className="text-gray-200"><MarkdownRenderer>{c.content}</MarkdownRenderer></p><p className="text-xs text-gray-400 text-right">{c.timestamp?.toDate ? c.timestamp.toDate().toLocaleString() : new Date(c.timestamp).toLocaleString()}</p></div>)))}
      </div>
      {currentUserId && (<div className="flex gap-2"><input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 shadow appearance-none border rounded-full py-2 px-3 bg-gray-800 bg-opacity-50 text-white leading-tight focus:outline-none focus:ring-1 focus:ring-blue-300" /><button onClick={handleAddComment} className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300">Post</button></div>)}
    </div>
  );
}

// AnonymousEntryCard component
function AnonymousEntryCard({ entry, userId, user, getUserDisplayName, handleRevealAuthor, handleGetTeaser, isLoadingTeaser, handleGetSimilarEntries, isLoadingSimilar, handleLikeToggle, handleDislikeToggle, handleAddComment, handleGetPublicSummary, isLoadingPublicSummary, handleGetPublicSentiment, isLoadingPublicSentiment, LucideIcons }) {
  return (
    <div className="bg-white bg-opacity-10 p-6 rounded-lg shadow-inner mb-6 border border-gray-700">
      <p className="text-gray-100 text-lg mb-4 italic leading-relaxed"><MarkdownRenderer>{entry.content}</MarkdownRenderer></p>
      {entry.tags?.length > 0 && (<p className="text-sm text-gray-300 mb-2">Tags: {entry.tags.map(t => `#${t}`).join(', ')}</p>)}
      <p className="text-sm text-gray-300 text-right">
        {entry.isAnonymous && entry.revealPrice > 0 && !entry.revealedBy?.includes(userId) ? (<>Author: Anonymous<button onClick={() => handleRevealAuthor(entry)} className="ml-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs hover:from-yellow-500 hover:to-orange-600 transition duration-300" title="Pay to reveal author">Reveal Author (${entry.revealPrice.toFixed(2)})</button><button onClick={() => handleGetTeaser(entry.id, entry.content)} disabled={isLoadingTeaser} className="ml-2 px-3 py-1 bg-gradient-to-r from-pink-400 to-red-400 text-white rounded-full text-xs hover:from-pink-500 hover:to-red-500 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" title="Get an AI-generated teaser for this entry">{isLoadingTeaser ? (<div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>) : ('Get Teaser ✨')}</button></>) : (<>Author: {entry.isAnonymous ? getUserDisplayName(entry.authorId) : getUserDisplayName(entry.authorId)} (User ID: <span className="font-mono break-all">{entry.userId}</span>)</>)}
      </p>
      <p className="text-xs text-gray-400 text-right">{entry.timestamp?.toDate ? entry.timestamp.toDate().toLocaleString() : new Date(entry.timestamp).toLocaleString()}</p>
      <div className="flex justify-end items-center mt-4 space-x-3">
        {user && (<><button onClick={() => handleLikeToggle(entry.id, entry.authorId, entry.likes || [], entry.dislikes || [])} className={`px-3 py-1 rounded-full text-sm font-semibold transition duration-300 ${entry.likes?.includes(userId) ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-pink-100'}`} title="Like this entry">❤️ {entry.likes?.length || 0}</button><button onClick={() => handleDislikeToggle(entry.id, entry.authorId, entry.likes || [], entry.dislikes || [])} className={`px-3 py-1 rounded-full text-sm font-semibold transition duration-300 ${entry.dislikes?.includes(userId) ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-red-100'}`} title="Dislike this entry">👎 {entry.dislikes?.length || 0}</button></>)}
        {entry.content && (<button onClick={() => handleGetSimilarEntries(entry.id, entry.content)} disabled={isLoadingSimilar} className="ai-icon-button text-blue-400 hover:bg-blue-100" title="Find similar entries using AI">{isLoadingSimilar ? (<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-400"></div>) : (<LucideIcons.Search size={20} />)}</button>)}
        {entry.content && (<button onClick={() => handleGetPublicSummary(entry.id, entry.content)} disabled={isLoadingPublicSummary} className="ai-icon-button text-sky-500 hover:bg-sky-100" title="Get AI-generated summary">{isLoadingPublicSummary ? (<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-sky-500"></div>) : (<LucideIcons.MessageSquareQuote size={20} />)}</button>)}
        {entry.content && (<button onClick={() => handleGetPublicSentiment(entry.id, entry.content)} disabled={isLoadingPublicSentiment} className="ai-icon-button text-purple-500 hover:bg-purple-100" title="Analyze the sentiment">{isLoadingPublicSentiment ? (<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>) : (<LucideIcons.TrendingUp size={20} />)}</button>)}
      </div>
      <CommentSection entryId={entry.id} comments={entry.comments || []} onAddComment={handleAddComment} currentUserId={userId} />
    </div>
  );
}

// Anonymous feed component
function AnonymousFeed() {
  const { user, userId, userProfiles, updateUsersBalanceAndEarnings, ownerWalletRef, generateContentWithGemini, db, collection, addDoc, query, where, getDocs, onSnapshot, doc, updateDoc, setDoc, arrayUnion, arrayRemove, orderBy, limit, FieldValue, getDoc: getDocFromContext, LucideIcons } = useAppContext();
  const [displayedEntries, setDisplayedEntries] = useState([]);
  const [lastVisibleDoc, setLastVisibleDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [message, setMessage] = useState('');
  const [showTeaserModal, setShowTeaserModal] = useState(false);
  const [teaserResult, setTeaserResult] = useState('');
  const [showSimilarEntriesModal, setShowSimilarEntriesModal] = useState(false);
  const [similarEntriesResult, setSimilarEntriesResult] = useState('');
  const [isLoadingTeaser, setIsLoadingTeaser] = useState(false);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [sortBy, setSortBy] = useState('timestamp'); // New state for sorting
  const [sortOrder, setSortOrder] = useState('desc'); // New state for sort order

  // States for new AI features on anonymous feed entries
  const [showPublicSummaryModal, setShowPublicSummaryModal] = useState(false);
  const [publicSummaryResult, setPublicSummaryResult] = useState('');
  const [isLoadingPublicSummary, setIsLoadingPublicSummary] = useState(false);
  const [showPublicSentimentModal, setShowPublicSentimentModal] = useState(false);
  const [publicSentimentResult, setPublicSentimentResult] = useState('');
  const [isLoadingPublicSentiment, setIsLoadingPublicSentiment] = useState(false);

  const [spotlightedEntry, setSpotlightedEntry] = useState(null);

  const getUserDisplayName = useCallback((authorId) => userProfiles.find(p => p.id === authorId)?.displayName || 'Anonymous User', [userProfiles]);

  const fetchEntries = useCallback(async (startAfterDoc = null) => {
    if (!db) return; setIsLoadingMore(true); setMessage('Loading more anonymous thoughts...');
    
    // Fetch spotlighted entry first
    let currentSpotlight = null;
    try {
      const spotlightSnap = await getDoc(doc(db, `artifacts/${appId}/public/data/app_metadata/current_spotlight`));
      if (spotlightSnap.exists()) {
        const data = spotlightSnap.data();
        const now = serverTimestamp().toDate(); // Get current server time approximation
        const spotlightDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (data.spotlightStartTime && (now.getTime() - data.spotlightStartTime.toDate().getTime() < spotlightDuration)) {
          // Spotlight is still active
          const entrySnap = await getDoc(doc(db, `artifacts/${appId}/public/data/anonymous_entries`, data.entryId));
          if (entrySnap.exists()) {
            currentSpotlight = { id: entrySnap.id, ...entrySnap.data() };
            const comments = (await getDocs(query(collection(db, `artifacts/${appId}/public/data/anonymous_entries/${currentSpotlight.id}/comments`), orderBy("timestamp")))).docs.map(c => ({ id: c.id, ...c.data() }));
            currentSpotlight = { ...currentSpotlight, comments };
          }
        } else {
          // Spotlight expired, clear it
          await updateDoc(doc(db, `artifacts/${appId}/public/data/app_metadata/current_spotlight`), { entryId: null, spotlightedByUserId: null, spotlightStartTime: null, entryContentSnapshot: null, authorId: null });
        }
      }
    } catch (e) {
      console.error("Error fetching spotlighted entry:", e);
    }
    setSpotlightedEntry(currentSpotlight);

    let q;
    if (sortBy === 'timestamp') {
      q = query(collection(db, `artifacts/${appId}/public/data/anonymous_entries`), orderBy("timestamp", sortOrder), limit(5));
      if (startAfterDoc) q = query(collection(db, `artifacts/${appId}/public/data/anonymous_entries`), orderBy("timestamp", sortOrder), startAfter(startAfterDoc), limit(5));
    } else if (sortBy === 'likesCount') {
      q = query(collection(db, `artifacts/${appId}/public/data/anonymous_entries`), orderBy("likesCount", "desc"), orderBy("timestamp", "desc"), limit(5));
      if (startAfterDoc) q = query(collection(db, `artifacts/${appId}/public/data/anonymous_entries`), orderBy("likesCount", "desc"), orderBy("timestamp", "desc"), startAfter(startAfterDoc), limit(5));
    }

    try {
      const snapshot = await getDocs(q);
      let fetchedEntries = await Promise.all(snapshot.docs.map(async d => {
        const entryData = { id: d.id, ...d.data() };
        const comments = (await getDocs(query(collection(db, `artifacts/${appId}/public/data/anonymous_entries/${entryData.id}/comments`), orderBy("timestamp")))).docs.map(c => ({ id: c.id, ...c.data() }));
        return { ...entryData, comments };
      }));

      // Filter out the spotlighted entry from the regular feed if it's already displayed
      if (currentSpotlight) {
        fetchedEntries = fetchedEntries.filter(entry => entry.id !== currentSpotlight.id);
      }

      setDisplayedEntries(prev => [...prev.filter(pe => !fetchedEntries.some(fe => fe.id === pe.id)), ...fetchedEntries]);
      setLastVisibleDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(fetchedEntries.length === 5); setMessage('');
    } catch (e) { console.error("Error fetching anonymous entries:", e); setMessage(`Failed to load entries: ${e.message}`); } finally { setIsLoadingMore(false); }
  }, [db, collection, orderBy, limit, startAfter, getDocs, sortBy, sortOrder, doc, getDoc, updateDoc, serverTimestamp]);

  useEffect(() => { 
    // Reset entries and fetch new ones when sort criteria changes
    setDisplayedEntries([]);
    setLastVisibleDoc(null);
    setHasMore(true);
    fetchEntries(); 
  }, [fetchEntries, sortBy, sortOrder]);


  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(query(collection(db, `artifacts/${appId}/public/data/anonymous_entries`), orderBy("timestamp", "desc"), limit(1)), (snapshot) => {
      if (!snapshot.empty) {
        const latestEntry = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setDisplayedEntries(prev => prev.some(e => e.id === latestEntry.id) ? prev : [latestEntry, ...prev]);
      }
    }, (e) => console.error("Error listening for new anonymous entries:", e));
    
    // Listen for spotlight changes
    const unsubSpotlight = onSnapshot(doc(db, `artifacts/${appId}/public/data/app_metadata/current_spotlight`), async (spotlightSnap) => {
      let currentSpotlight = null;
      if (spotlightSnap.exists()) {
        const data = spotlightSnap.data();
        const now = serverTimestamp().toDate();
        const spotlightDuration = 24 * 60 * 60 * 1000;

        if (data.spotlightStartTime && (now.getTime() - data.spotlightStartTime.toDate().getTime() < spotlightDuration)) {
          const entrySnap = await getDoc(doc(db, `artifacts/${appId}/public/data/anonymous_entries`, data.entryId));
          if (entrySnap.exists()) {
            currentSpotlight = { id: entrySnap.id, ...entrySnap.data() };
            const comments = (await getDocs(query(collection(db, `artifacts/${appId}/public/data/anonymous_entries/${currentSpotlight.id}/comments`), orderBy("timestamp")))).docs.map(c => ({ id: c.id, ...c.data() }));
            currentSpotlight = { ...currentSpotlight, comments };
          }
        } else {
          // Spotlight expired, clear it
          await updateDoc(doc(db, `artifacts/${appId}/public/data/app_metadata/current_spotlight`), { entryId: null, spotlightedByUserId: null, spotlightStartTime: null, entryContentSnapshot: null, authorId: null });
        }
      }
      setSpotlightedEntry(currentSpotlight);
    }, (e) => console.error("Error listening for spotlight changes:", e));

    return () => { unsubscribe(); unsubSpotlight(); };
  }, [db, collection, orderBy, limit, onSnapshot, doc, getDoc, updateDoc, query, serverTimestamp]);

  const handleLoadMore = useCallback(() => { if (hasMore && !isLoadingMore) fetchEntries(lastVisibleDoc); }, [hasMore, isLoadingMore, lastVisibleDoc, fetchEntries]);

  const handleLikeToggle = useCallback(async (entryId, authorId, currentLikes, currentDislikes) => {
    if (!user) { setMessage("Please sign in to like entries."); return; } if (!db) { setMessage('Database not initialized. Cannot toggle like.'); return; }
    const entryRef = doc(db, `artifacts/${appId}/public/data/anonymous_entries`, entryId);
    const authorProfileRef = doc(db, `artifacts/${appId}/public/data/user_profiles`, authorId);
    const userProfileRef = doc(db, `artifacts/${appId}/public/data/user_profiles`, userId); // Current user's profile
    const userLiked = currentLikes.includes(userId); const userDisliked = currentDislikes.includes(userId);
    try {
      if (userLiked) { await updateDoc(entryRef, { likes: arrayRemove(userId), likesCount: FieldValue.increment(-1) }); await updateDoc(authorProfileRef, { likesCount: FieldValue.increment(-1) }); setMessage("Entry unliked."); }
      else {
        await updateDoc(entryRef, { likes: arrayUnion(userId), likesCount: FieldValue.increment(1) }); await updateDoc(authorProfileRef, { likesCount: FieldValue.increment(1) }); setMessage("Entry liked!");
        if (userDisliked) { await updateDoc(entryRef, { dislikes: arrayRemove(userId), dislikesCount: FieldValue.increment(-1) }); await updateDoc(authorProfileRef, { dislikesCount: FieldValue.increment(-1) }); }
        if (authorId !== userId) { await addDoc(collection(db, `artifacts/${appId}/users/${authorId}/notifications`), { type: 'like', fromUserId: userId, fromUserName: user?.displayName || 'Anonymous User', message: `${user?.displayName || 'Someone'} liked your anonymous entry!`, timestamp: serverTimestamp(), read: false, entryId, }); }
        // Increment engagement points for the current user
        await updateDoc(userProfileRef, { engagementPoints: FieldValue.increment(0.5) });
      }
    } catch (e) { console.error("Error toggling like:", e); setMessage(`Failed to toggle like: ${e.message}`); }
  }, [user, userId, db, doc, updateDoc, arrayRemove, arrayUnion, FieldValue, collection, addDoc, serverTimestamp]);

  const handleDislikeToggle = useCallback(async (entryId, authorId, currentLikes, currentDislikes) => {
    if (!user) { setMessage("Please sign in to dislike entries."); return; } if (!db) { setMessage('Database not initialized. Cannot toggle dislike.'); return; }
    const entryRef = doc(db, `artifacts/${appId}/public/data/anonymous_entries`, entryId);
    const authorProfileRef = doc(db, `artifacts/${appId}/public/data/user_profiles`, authorId);
    const userProfileRef = doc(db, `artifacts/${appId}/public/data/user_profiles`, userId); // Current user's profile
    const userLiked = currentLikes.includes(userId); const userDisliked = currentDislikes.includes(userId);
    try {
      if (userDisliked) { await updateDoc(entryRef, { dislikes: arrayRemove(userId), dislikesCount: FieldValue.increment(-1) }); await updateDoc(authorProfileRef, { dislikesCount: FieldValue.increment(-1) }); setMessage("Entry undisliked."); }
      else {
        await updateDoc(entryRef, { dislikes: arrayUnion(userId), dislikesCount: FieldValue.increment(1) }); await updateDoc(authorProfileRef, { dislikesCount: FieldValue.increment(1) }); setMessage("Entry disliked!");
        if (userLiked) { await updateDoc(entryRef, { likes: arrayRemove(userId), likesCount: FieldValue.increment(-1) }); await updateDoc(authorProfileRef, { likesCount: FieldValue.increment(-1) }); }
        if (authorId !== userId) { await addDoc(collection(db, `artifacts/${appId}/users/${authorId}/notifications`), { type: 'dislike', fromUserId: userId, fromUserName: user?.displayName || 'Anonymous User', message: `${user?.displayName || 'Someone'} disliked your anonymous entry.`, timestamp: serverTimestamp(), read: false, entryId, }); }
        // Increment engagement points for the current user
        await updateDoc(userProfileRef, { engagementPoints: FieldValue.increment(0.5) });
      }
    } catch (e) { console.error("Error toggling dislike:", e); setMessage(`Failed to toggle dislike: ${e.message}`); }
  }, [user, userId, db, doc, updateDoc, arrayRemove, arrayUnion, FieldValue, collection, addDoc, serverTimestamp]);

  const handleAddComment = useCallback(async (entryId, commentContent) => {
    if (!user) throw new Error("User not authenticated to add comments."); if (!db) throw new Error('Database not initialized. Cannot add comment.');
    const userProfileRef = doc(db, `artifacts/${appId}/public/data/user_profiles`, userId); // Current user's profile
    await addDoc(collection(db, `artifacts/${appId}/public/data/anonymous_entries/${entryId}/comments`), { content: commentContent, authorId: userId, authorName: user.displayName || 'Anonymous User', timestamp: serverTimestamp(), });
    const entryDoc = await getDoc(doc(db, `artifacts/${appId}/public/data/anonymous_entries`, entryId));
    if (entryDoc.exists() && entryDoc.data().authorId !== userId) {
      await addDoc(collection(db, `artifacts/${appId}/users/${entryDoc.data().authorId}/notifications`), { type: 'comment', fromUserId: userId, fromUserName: user?.displayName || 'Anonymous User', message: `${user?.displayName || 'Someone'} commented on your anonymous entry: "${commentContent.substring(0, 50)}..."`, timestamp: serverTimestamp(), read: false, entryId, });
    }
    // Increment engagement points for the current user
    await updateDoc(userProfileRef, { engagementPoints: FieldValue.increment(0.5) });
  }, [user, userId, db, collection, addDoc, doc, getDoc, serverTimestamp, FieldValue]);

  const handleRevealAuthor = useCallback(async (entry) => {
    if (!user) { setMessage("Please sign in to reveal author."); return; } if (entry.authorId === userId) { setMessage("You are the author of this entry."); return; } if (!db) { setMessage('Database not initialized. Cannot reveal author.'); return; }
    const userProfile = userProfiles.find(p => p.id === userId);
    if (!userProfile || userProfile.balance < entry.revealPrice) { setMessage(`Not enough funds to reveal author. You need $${entry.revealPrice.toFixed(2)}.`); return; }
    
    // Check if already revealed by this user
    if (entry.revealedBy?.includes(userId)) {
      setMessage("You have already revealed this author.");
      return;
    }

    const userProfileRef = doc(db, `artifacts/${appId}/public/data/user_profiles`, userId); // Current user's profile

    try {
      await updateUsersBalanceAndEarnings(userId, -entry.revealPrice, 0);
      await updateUsersBalanceAndEarnings(entry.authorId, 0, entry.revealPrice * 0.25);
      const ownerWalletSnap = await getDoc(ownerWalletRef); await setDoc(ownerWalletRef, { balance: (ownerWalletSnap.exists() ? ownerWalletSnap.data().balance : 0) + entry.revealPrice * 0.75 }, { merge: true });
      await updateDoc(doc(db, `artifacts/${appId}/public/data/anonymous_entries`, entry.id), { revealedBy: arrayUnion(userId) });
      setMessage(`Author revealed! $${entry.revealPrice.toFixed(2)} paid. Author earned $${(entry.revealPrice * 0.25).toFixed(2)}.`);
      await addDoc(collection(db, `artifacts/${appId}/users/${entry.authorId}/notifications`), { type: 'reveal', fromUserId: userId, fromUserName: user?.displayName || 'Anonymous User', message: `${user?.displayName || 'Someone'} paid to reveal your anonymous entry!`, timestamp: serverTimestamp(), read: false, entryId: entry.id, });
      // Increment engagement points for the current user
      await updateDoc(userProfileRef, { engagementPoints: FieldValue.increment(0.5) });
    } catch (e) { console.error("Error revealing author:", e); setMessage(`Failed to reveal author: ${e.message}`); }
  }, [user, userId, userProfiles, updateUsersBalanceAndEarnings, ownerWalletRef, db, doc, getDoc, setDoc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp, FieldValue]);

  const handleGetTeaser = useCallback(async (entryId, contentToTease) => {
    setIsLoadingTeaser(true); setTeaserResult(''); try {
      const entryRef = doc(db, `artifacts/${appId}/public/data/anonymous_entries`, entryId);
      const cachedTeaser = (await getDoc(entryRef)).data()?.aiTeaser;
      if (cachedTeaser) { setTeaserResult(cachedTeaser); setShowTeaserModal(true); setMessage('Teaser loaded from cache!'); return; }
      const generatedText = await generateContentWithGemini(`Write a very short, intriguing, and mysterious teaser (around 20-30 words) for the following journal entry to make someone want to pay to reveal the author. Do not reveal any specific details, just hint at the emotion or topic. Use simple, everyday language, and make it easy for an average person to understand. Journal entry: "${contentToTease}"`);
      if (generatedText) { await updateDoc(entryRef, { aiTeaser: generatedText }); setTeaserResult(generatedText); setShowTeaserModal(true); setMessage('Teaser generated and cached!'); } else setMessage('Failed to generate teaser. Please try again.');
    } catch (e) { console.error("Error calling Gemini API for teaser:", e); setMessage(`Error generating teaser: ${e.message}`); } finally { setIsLoadingTeaser(false); }
  }, [db, doc, getDoc, updateDoc, generateContentWithGemini]);

  const handleGetSimilarEntries = useCallback(async (entryId, currentEntryContent) => {
    setIsLoadingSimilar(true); setSimilarEntriesResult(''); try {
      const entryRef = doc(db, `artifacts/${appId}/public/data/anonymous_entries`, entryId);
      const cachedSimilarEntries = (await getDoc(entryRef)).data()?.aiSimilarEntries;
      if (cachedSimilarEntries) { setSimilarEntriesResult(cachedSimilarEntries); setShowSimilarEntriesModal(true); setMessage('Similar entries loaded from cache!'); return; }
      const generatedText = await generateContentWithGemini(`Given the following journal entry, find keywords or themes and then generate a list of 3-5 short, distinct, and anonymous journal entries (around 20-40 words each) that are semantically similar or explore related themes. Format your response as a numbered list. Use simple, everyday language, and make it easy for an average person to understand. Journal entry: "${currentEntryContent}"`);
      if (generatedText) { await updateDoc(entryRef, { aiSimilarEntries: generatedText }); setSimilarEntriesResult(generatedText); setShowSimilarEntriesModal(true); setMessage('Similar entries generated and cached!'); } else setMessage('Failed to find similar entries. Please try again.');
    } catch (e) { console.error("Error calling Gemini API for similar entries:", e); setMessage(`Error finding similar entries: ${e.message}`); } finally { setIsLoadingSimilar(false); }
  }, [db, doc, getDoc, updateDoc, generateContentWithGemini]);

  // New AI functions for anonymous feed entries
  const aiPublicAction = useCallback(async (type, entryId, contentToProcess, setFn, setShowFn, setIsLoadingFn, promptGenerator) => {
    setIsLoadingFn(true); setFn('');
    if (!db) { setMessage('Database not initialized. Cannot process.'); setIsLoadingFn(false); return; }
    try {
      const entryRef = doc(db, `artifacts/${appId}/public/data/anonymous_entries`, entryId);
      const cachedResult = (await getDoc(entryRef)).data()?.[`aiPublic${type}`];

      if (cachedResult) { setFn(cachedResult); setShowFn(true); setMessage(`${type} loaded from cache!`); return; }
      const generatedText = await generateContentWithGemini(promptGenerator(contentToProcess));
      if (generatedText) { await updateDoc(entryRef, { [`aiPublic${type}`]: generatedText }); setFn(generatedText); setShowFn(true); setMessage(`${type} generated and cached!`); } else setMessage(`Failed to generate ${type}. Please try again.`);
    } catch (e) { console.error(`Error calling Gemini API for ${type}:`, e); setMessage(`Error generating ${type}: ${e.message}`); } finally { setIsLoadingFn(false); }
  }, [generateContentWithGemini, db, doc, getDoc, updateDoc]);

  const handleGetPublicSummary = useCallback((entryId, contentToSummarize) => aiPublicAction('Summary', entryId, contentToSummarize, setPublicSummaryResult, setShowPublicSummaryModal, setIsLoadingPublicSummary, (c) => `Summarize the following journal entry concisely. Use simple, everyday language, and make it easy for an average person to understand. Journal entry: "${c}"`), [aiPublicAction]);
  const handleGetPublicSentiment = useCallback((entryId, contentToAnalyze) => aiPublicAction('Sentiment', entryId, contentToAnalyze, setPublicSentimentResult, setShowPublicSentimentModal, setIsLoadingPublicSentiment, (c) => `Analyze the sentiment of the following journal entry and describe it in a few words (e.g., 'very positive', 'slightly negative', 'neutral and reflective'). Also, identify the dominant emotion if any. Use simple, everyday language, and make it easy for an average person to understand. Journal entry: "${c}"`), [aiPublicAction]);


  return (
    <div className="p-6 bg-black bg-opacity-50 rounded-lg shadow-lg max-w-2xl mx-auto text-white">
      {message && <MessageBox message={message} onClose={() => setMessage('')} />}
      {showTeaserModal && <AIGeneratedContentModal title="AI Teaser" content={teaserResult} onClose={() => setShowTeaserModal(false)} LucideIcons={LucideIcons} />}
      {showSimilarEntriesModal && <AIGeneratedContentModal title="Similar Entries" content={similarEntriesResult} onClose={() => setShowSimilarEntriesModal(false)} LucideIcons={LucideIcons} />}
      {showPublicSummaryModal && <AIGeneratedContentModal title="Entry Summary" content={publicSummaryResult} onClose={() => setShowPublicSummaryModal(false)} LucideIcons={LucideIcons} />}
      {showPublicSentimentModal && <AIGeneratedContentModal title="Entry Sentiment" content={publicSentimentResult} onClose={() => setShowPublicSentimentModal(false)} LucideIcons={LucideIcons} />}

      <h2 className="text-3xl font-bold text-center mb-6 text-blue-300 font-playfair">Anonymous Thoughts</h2>
      <div className="flex justify-center items-center gap-4 mb-6">
        <label htmlFor="sort-by" className="text-gray-200 text-sm font-bold">Sort By:</label>
        <select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-gray-800 bg-opacity-50 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="timestamp">Most Recent</option>
          <option value="likesCount">Most Liked</option>
        </select>
        {sortBy === 'timestamp' && (
          <select id="sort-order" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="bg-gray-800 bg-opacity-50 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        )}
      </div>
      
      {/* Spotlighted Entry Display */}
      {spotlightedEntry && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-lg shadow-xl mb-6 border border-purple-400 animate-pulse-slow">
          <h3 className="text-2xl font-bold text-center text-white mb-4 flex items-center justify-center">
            <LucideIcons.Star size={24} className="mr-2 text-yellow-300" /> Spotlighted Entry!
          </h3>
          <AnonymousEntryCard 
            key={spotlightedEntry.id} 
            entry={spotlightedEntry} 
            userId={userId} 
            user={user} 
            userProfiles={userProfiles} 
            getUserDisplayName={getUserDisplayName} 
            handleRevealAuthor={handleRevealAuthor} 
            handleGetTeaser={handleGetTeaser} 
            isLoadingTeaser={isLoadingTeaser} 
            handleGetSimilarEntries={handleGetSimilarEntries} 
            isLoadingSimilar={isLoadingSimilar} 
            handleLikeToggle={handleLikeToggle} 
            handleDislikeToggle={handleDislikeToggle} 
            handleAddComment={handleAddComment}
            handleGetPublicSummary={handleGetPublicSummary}
            isLoadingPublicSummary={isLoadingPublicSummary}
            handleGetPublicSentiment={handleGetPublicSentiment}
            isLoadingPublicSentiment={isLoadingPublicSentiment}
            LucideIcons={LucideIcons}
          />
        </div>
      )}

      {displayedEntries.length === 0 && !isLoadingMore && !spotlightedEntry ? (<p className="text-center text-gray-200 text-lg">No anonymous entries found. Be the first to share!</p>) : (
        <div className="space-y-6">
          {displayedEntries.map(e => (
            // Only render if not the spotlighted entry
            spotlightedEntry && e.id === spotlightedEntry.id ? null :
            <AnonymousEntryCard 
              key={e.id} 
              entry={e} 
              userId={userId} 
              user={user} 
              userProfiles={userProfiles} 
              getUserDisplayName={getUserDisplayName} 
              handleRevealAuthor={handleRevealAuthor} 
              handleGetTeaser={handleGetTeaser} 
              isLoadingTeaser={isLoadingTeaser} 
              handleGetSimilarEntries={handleGetSimilarEntries} 
              isLoadingSimilar={isLoadingSimilar} 
              handleLikeToggle={handleLikeToggle} 
              handleDislikeToggle={handleDislikeToggle} 
              handleAddComment={handleAddComment}
              handleGetPublicSummary={handleGetPublicSummary}
              isLoadingPublicSummary={isLoadingPublicSummary}
              handleGetPublicSentiment={handleGetPublicSentiment}
              isLoadingPublicSentiment={isLoadingPublicSentiment}
              LucideIcons={LucideIcons}
            />
          ))}
        </div>
      )}
      {hasMore && (<button onClick={handleLoadMore} disabled={isLoadingMore} className="w-full px-6 py-3 bg-gradient-to-r from-indigo-400 to-rose-400 text-white font-bold rounded-full hover:from-indigo-500 hover:to-rose-500 transition duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6">
        {isLoadingMore ? (<div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>) : ('Next Anonymous Thoughts (Load More)')}
      </button>)}
      {!hasMore && displayedEntries.length > 0 && (<p className="text-center text-gray-400 mt-6">You've reached the end of the anonymous thoughts for now.</p>)}
    </div>
  );
}

// My entries component
function MyEntries() {
  const { user, userId, userProfiles, generateContentWithGemini, db, collection, addDoc, query, where, getDocs, onSnapshot, doc, deleteDoc, updateDoc, orderBy, limit, FieldValue, serverTimestamp, LucideIcons } = useAppContext();
  const [myEntries, setMyEntries] = useState([]);
  const [message, setMessage] = useState('');
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [editedIsAnonymous, setEditedIsAnonymous] = useState(true);
  const [editedTags, setEditedTags] = useState('');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryResult, setSummaryResult] = useState('');
  const [showSentimentModal, setShowSentimentModal] = useState(false);
  const [isLoadingSentiment, setIsLoadingSentiment] = useState(false);
  const [sentimentResult, setSentimentResult] = useState('');
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const currentUserProfile = userProfiles.find(p => p.id === userId);
  const canSpotlight = (currentUserProfile?.engagementPoints || 0) >= 1000;

  useEffect(() => {
    if (!userId || !db) return;
    const unsubPrivate = onSnapshot(collection(db, `artifacts/${appId}/users/${userId}/my_entries`), (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMyEntries(prev => [...fetched, ...prev.filter(e => e.isAnonymous && e.authorId === userId)].sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0)));
    }, (e) => { console.error("Error listening to private entries: ", e); setMessage(`Real-time update error for your private entries: ${e.message}`); });
    const unsubPublicAnonymous = onSnapshot(query(collection(db, `artifacts/${appId}/public/data/anonymous_entries`), where("authorId", "==", userId)), (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMyEntries(prev => [...fetched, ...prev.filter(e => !e.isAnonymous || e.authorId !== userId)].sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0)));
    }, (e) => { console.error("Error listening to public anonymous entries for user: ", e); setMessage(`Real-time update error for your anonymous entries: ${e.message}`); });
    return () => { unsubPrivate(); unsubPublicAnonymous(); };
  }, [userId, db, collection, onSnapshot, query, where]);

  const handleDelete = useCallback(async (entryId, isAnonymousEntry) => {
    if (!db) { setMessage('Database not initialized. Cannot delete entry.'); return; }
    try { await deleteDoc(doc(db, `${isAnonymousEntry ? `artifacts/${appId}/public/data/anonymous_entries` : `artifacts/${appId}/users/${userId}/my_entries`}`, entryId)); setMessage('Entry deleted successfully!'); }
    catch (e) { console.error("Error deleting document: ", e); setMessage(`Failed to delete entry: ${e.message}`); }
  }, [userId, db, doc, deleteDoc]);

  const handleEdit = useCallback((entry) => { setEditingEntryId(entry.id); setEditedContent(entry.content); setEditedIsAnonymous(entry.isAnonymous); setEditedTags(entry.tags ? entry.tags.join(', ') : ''); }, []);

  const handleSaveEdit = useCallback(async (entryId, originalIsAnonymous) => {
    if (!db) { setMessage('Database not initialized. Cannot save edit.'); return; }
    try {
      const originalPath = originalIsAnonymous ? `artifacts/${appId}/public/data/anonymous_entries` : `artifacts/${appId}/users/${userId}/my_entries`;
      const newPath = editedIsAnonymous ? `artifacts/${appId}/public/data/anonymous_entries` : `artifacts/${appId}/users/${userId}/my_entries`;
      const newTags = editedTags.split(',').map(t => t.trim()).filter(t => t !== '');
      if (originalPath === newPath) { await updateDoc(doc(db, originalPath, entryId), { content: editedContent.trim(), isAnonymous: editedIsAnonymous, authorName: editedIsAnonymous ? 'Anonymous' : (user?.displayName || 'Unknown User'), tags: newTags, }); }
      else {
        const entryToMove = myEntries.find(e => e.id === entryId);
        if (entryToMove) {
          await addDoc(collection(db, newPath), { ...entryToMove, content: editedContent.trim(), isAnonymous: editedIsAnonymous, authorName: editedIsAnonymous ? 'Anonymous' : (user?.displayName || 'Unknown User'), timestamp: serverTimestamp(), tags: newTags, });
          await deleteDoc(doc(db, originalPath, entryId));
        }
      }
      setMessage('Entry updated successfully!'); setEditingEntryId(null); setEditedContent(''); setEditedTags('');
    } catch (e) { console.error("Error updating document: ", e); setMessage(`Failed to update entry: ${e.message}`); }
  }, [editedContent, editedIsAnonymous, editedTags, userId, user, myEntries, db, updateDoc, doc, addDoc, collection, deleteDoc, serverTimestamp]);

  const aiAction = useCallback(async (type, entryId, contentToProcess, setFn, setShowFn, setIsLoadingFn, promptGenerator) => {
    setIsLoadingFn(true); setFn('');
    if (!db) { setMessage('Database not initialized. Cannot process.'); setIsLoadingFn(false); return; }
    try {
      const entryData = myEntries.find(e => e.id === entryId);
      const collectionPath = entryData.isAnonymous ? `artifacts/${appId}/public/data/anonymous_entries` : `artifacts/${appId}/users/${userId}/my_entries`;
      const entryRef = doc(db, collectionPath, entryId);
      const cachedResult = (await getDoc(entryRef)).data()?.[`ai${type}`];

      if (cachedResult) { setFn(cachedResult); setShowFn(true); setMessage(`${type} loaded from cache!`); return; }
      const generatedText = await generateContentWithGemini(promptGenerator(contentToProcess));
      if (generatedText) { await updateDoc(entryRef, { [`ai${type}`]: generatedText }); setFn(generatedText); setShowFn(true); setMessage(`${type} generated and cached!`); } else setMessage(`Failed to generate ${type}. Please try again.`);
    } catch (e) { console.error(`Error calling Gemini API for ${type}:`, e); setMessage(`Error generating ${type}: ${e.message}`); } finally { setIsLoadingFn(false); }
  }, [generateContentWithGemini, db, userId, doc, getDoc, updateDoc, myEntries]);

  const handleSummarizeEntry = useCallback((entryId, contentToSummarize) => aiAction('Summary', entryId, contentToSummarize, setSummaryResult, setShowSummaryModal, setIsLoadingSummary, (c) => `Summarize the following journal entry concisely. Use simple, everyday language, and make it easy for an average person to understand. Journal entry: "${c}"`), [aiAction]);
  const handleAnalyzeSentiment = useCallback((entryId, contentToAnalyze) => aiAction('Sentiment', entryId, contentToAnalyze, setSentimentResult, setShowSentimentModal, setIsLoadingSentiment, (c) => `Analyze the sentiment of the following journal entry and describe it in a few words (e.g., 'very positive', 'slightly negative', 'neutral and reflective'). Also, identify the dominant emotion if any. Use simple, everyday language, and make it easy for an average person to understand. Journal entry: "${c}"`), [aiAction]);
  const handleGetFollowUpQuestion = useCallback((entryId, entryContent) => aiAction('FollowUpQuestion', entryId, entryContent, setFollowUpQuestion, setShowFollowUpModal, setIsLoadingFollowUp, (c) => `Based on the following journal entry, generate one insightful and thought-provoking follow-up question to encourage deeper self-reflection. Keep the question concise. Use simple, everyday language, and make it easy for an average person to understand. Journal entry: "${c}"`), [aiAction]);

  const handleSpotlightEntry = useCallback(async (entry) => {
    if (!user) { setMessage("Please sign in to spotlight an entry."); return; }
    if (!db) { setMessage('Database not initialized. Cannot spotlight entry.'); return; }
    if (!canSpotlight) { setMessage("You need 1000 engagement points to spotlight an entry."); return; }
    if (entry.isAnonymous === false) { setMessage("Only anonymous entries can be spotlighted."); return; }

    try {
      // Clear any existing spotlight
      const currentSpotlightRef = doc(db, `artifacts/${appId}/public/data/app_metadata/current_spotlight`);
      const currentSpotlightSnap = await getDoc(currentSpotlightRef);
      if (currentSpotlightSnap.exists() && currentSpotlightSnap.data().entryId) {
        // Optionally, clear isSpotlighted flag on the old entry if it exists
        const oldEntryRef = doc(db, `artifacts/${appId}/public/data/anonymous_entries`, currentSpotlightSnap.data().entryId);
        await updateDoc(oldEntryRef, { isSpotlighted: FieldValue.delete(), spotlightTimestamp: FieldValue.delete() });
      }

      // Set new spotlight
      await setDoc(currentSpotlightRef, {
        entryId: entry.id,
        spotlightedByUserId: userId,
        spotlightStartTime: serverTimestamp(),
        entryContentSnapshot: entry.content, // Store a snapshot for quick display
        authorId: entry.authorId,
      });

      // Update the entry itself
      const entryRef = doc(db, `artifacts/${appId}/public/data/anonymous_entries`, entry.id);
      await updateDoc(entryRef, { isSpotlighted: true, spotlightTimestamp: serverTimestamp() });

      // Deduct engagement points
      const userProfileRef = doc(db, `artifacts/${appId}/public/data/user_profiles`, userId);
      await updateDoc(userProfileRef, { engagementPoints: FieldValue.increment(-1000) });

      setMessage(`Entry "${entry.content.substring(0, 30)}..." spotlighted successfully!`);
    } catch (e) {
      console.error("Error spotlighting entry:", e);
      setMessage(`Failed to spotlight entry: ${e.message}`);
    }
  }, [user, userId, db, canSpotlight, FieldValue, serverTimestamp, doc, setDoc, updateDoc]);


  const filteredEntries = useMemo(() => myEntries.filter(e => e.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || (e.tags && e.tags.some(t => t.toLowerCase().includes(debouncedSearchTerm.toLowerCase())))), [myEntries, debouncedSearchTerm]);

  return (
    <div className="p-6 bg-black bg-opacity-50 rounded-lg shadow-lg max-w-2xl mx-auto text-white">
      {message && <MessageBox message={message} onClose={() => setMessage('')} />}
      {showSummaryModal && <AIGeneratedContentModal title="Journal Summary" content={summaryResult} onClose={() => setShowSummaryModal(false)} LucideIcons={LucideIcons} />}
      {showSentimentModal && <AIGeneratedContentModal title="Sentiment Analysis" content={sentimentResult} onClose={() => setShowSentimentModal(false)} LucideIcons={LucideIcons} />}
      {showFollowUpModal && <AIGeneratedContentModal title="Follow-Up Question" content={followUpQuestion} onClose={() => setShowFollowUpModal(false)} LucideIcons={LucideIcons} />}
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-300 font-playfair">My Journal Entries</h2>
      <div className="mb-4"><input type="text" placeholder="Search your entries by content or tags..." className="shadow appearance-none border rounded-full w-full py-2 px-4 bg-gray-800 bg-opacity-50 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
      {filteredEntries.length === 0 ? (<p className="text-center text-gray-200 text-lg">You haven't written any entries yet or no matches found.</p>) : (
        <div className="space-y-6">
          {filteredEntries.map(e => (<div key={e.id} className="bg-white bg-opacity-10 p-6 rounded-lg shadow-inner mb-6 border border-gray-700">
            {editingEntryId === e.id ? (
              <div>
                <textarea className="shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-800 bg-opacity-50 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent h-32 resize-y mb-3" value={editedContent} onChange={(el) => setEditedContent(el.target.value)}></textarea>
                <div className="mb-4"><label htmlFor="editJournalTags" className="block text-gray-200 text-sm font-bold mb-2">Tags (comma-separated):</label><input type="text" id="editJournalTags" className="shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-800 bg-opacity-50 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" value={editedTags} onChange={(el) => setEditedTags(el.target.value)} /></div>
                <div className="mb-4 flex items-center"><input type="checkbox" id={`editIsAnonymous-${e.id}`} className="mr-2 h-5 w-5 text-blue-600 rounded focus:ring-blue-500" checked={editedIsAnonymous} onChange={(el) => setEditedIsAnonymous(el.target.checked)} /><label htmlFor={`editIsAnonymous-${e.id}`} className="text-gray-200 text-sm font-bold">Share Anonymously</label></div>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => handleSaveEdit(e.id, e.isAnonymous)} className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" title="Save changes">Save</button>
                  <button onClick={() => setEditingEntryId(null)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-300" title="Cancel editing">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-100 text-lg mb-4 italic leading-relaxed"><MarkdownRenderer>{e.content}</MarkdownRenderer></p>
                {e.tags?.length > 0 && (
                  <p className="text-sm text-gray-300 mb-2">Tags: {e.tags.map(t => `#${t}`).join(', ')}</p>
                )}
                <p className="text-sm text-gray-300 text-right">- {e.isAnonymous ? 'Anonymous' : (e.authorName || 'You')}{e.userId && ` (User ID: ${e.userId})`}</p>
                <p className="text-xs text-gray-400 text-right">{e.timestamp?.toDate ? e.timestamp.toDate().toLocaleString() : new Date(e.timestamp).toLocaleString()}</p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button onClick={() => handleEdit(e)} className="ai-icon-button text-yellow-500 hover:bg-yellow-100" title="Edit this entry"><LucideIcons.Edit size={20} /></button>
                  <button onClick={() => handleDelete(e.id, e.isAnonymous)} className="ai-icon-button text-red-500 hover:bg-red-100" title="Delete this entry"><LucideIcons.Trash2 size={20} /></button>
                  <div className="flex gap-2">
                    <button onClick={() => handleSummarizeEntry(e.id, e.content)} disabled={isLoadingSummary} className="ai-icon-button text-sky-500 hover:bg-sky-100" title="Get an AI-generated summary">{isLoadingSummary ? (<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-sky-500"></div>) : (<LucideIcons.MessageSquareQuote size={20} />)}</button>
                    <button onClick={() => handleAnalyzeSentiment(e.id, e.content)} disabled={isLoadingSentiment} className="ai-icon-button text-purple-500 hover:bg-purple-100" title="Analyze the sentiment of this entry">{isLoadingSentiment ? (<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>) : (<LucideIcons.TrendingUp size={20} />)}</button>
                    <button onClick={() => handleGetFollowUpQuestion(e.id, e.content)} disabled={isLoadingFollowUp} className="ai-icon-button text-teal-400 hover:bg-teal-100" title="Get an AI-generated follow-up question">{isLoadingFollowUp ? (<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-teal-400"></div>) : (<LucideIcons.Lightbulb size={20} />)}</button>
                  </div>
                  {e.isAnonymous && canSpotlight && (
                    <button onClick={() => handleSpotlightEntry(e)} className="ai-icon-button text-yellow-300 hover:bg-yellow-100" title="Spotlight this entry! (1000 points)">
                      <LucideIcons.Award size={20} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>))}
        </div>
      )}
    </div>
  );
}

// User profile display and edit component
function UserProfile({ profileUser, onMessageUser, onConnectUser, isConnected, isSelf }) {
  const { user, userId, updateUserProfile, generateContentWithGemini, db, collection, query, where, orderBy, limit, onSnapshot, uploadFile, LucideIcons } = useAppContext();
  const [message, setMessage] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [currentBio, setCurrentBio] = useState(profileUser.bio || '');
  const [currentInterests, setCurrentInterests] = useState(profileUser.interests ? profileUser.interests.join(', ') : '');
  const [currentLocation, setCurrentLocation] = useState(profileUser.location || '');
  const [currentPhotoURL, setCurrentPhotoURL] = useState(profileUser.photoURL || '');
  const [isLoadingBioSuggestion, setIsLoadingBioSuggestion] = useState(false);
  const [currentImageGallery, setCurrentImageGallery] = useState(profileUser.imageGallery ? profileUser.imageGallery.join(', ') : '');
  const [userEntries, setUserEntries] = useState([]);
  const [expandedEntries, setExpandedEntries] = useState(new Set());

  const profilePhotoInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [profilePhotoUploadProgress, setProfilePhotoUploadProgress] = useState(0);
  const [uploadingGalleryMedia, setUploadingGalleryMedia] = useState(false);
  const [galleryMediaUploadProgress, setGalleryMediaUploadProgress] = useState(0);

  const [showBioSummaryModal, setShowBioSummaryModal] = useState(false);
  const [isLoadingBioSummary, setIsLoadingBioSummary] = useState(false);
  const [bioSummaryResult, setBioSummaryResult] = useState('');
  const [showInterestAnalysisModal, setShowInterestAnalysisModal] = useState(false);
  const [isLoadingInterestAnalysis, setIsLoadingInterestAnalysis] = useState(false);
  const [interestAnalysisResult, setInterestAnalysisResult] = useState('');
  const [showConversationStarterModal, setShowConversationStarterModal] = useState(false);
  const [isLoadingConversationStarter, setIsLoadingConversationStarter] = useState(false);
  const [conversationStarterResult, setConversationStarterResult] = useState('');

  const defaultProfileImage = "https://placehold.co/100x100/AEC6CF/FFFFFF?text=User";

  const handleProfilePhotoUpload = useCallback(async (e) => {
    const file = e.target.files[0]; if (!file) return; setUploadingProfilePhoto(true); setProfilePhotoUploadProgress(0);
    try { const url = await uploadFile(file, `profile_pictures/${userId}/${file.name}`, setProfilePhotoUploadProgress); setCurrentPhotoURL(url); setMessage('Profile photo uploaded successfully!'); }
    catch (err) { console.error("Error uploading profile photo:", err); setMessage(`Failed to upload profile photo: ${err.message}`); } finally { setUploadingProfilePhoto(false); }
  }, [userId, uploadFile]);

  const handleImageGalleryUpload = useCallback(async (e) => {
    const files = e.target.files; if (files.length === 0) return; setUploadingGalleryMedia(true); setGalleryMediaUploadProgress(0); const uploadedUrls = []; let uploadError = false;
    for (const file of Array.from(files)) {
      try { const url = await uploadFile(file, `image_galleries/${userId}/${Date.now()}_${file.name}`, setGalleryMediaUploadProgress); uploadedUrls.push(url); }
      catch (err) { console.error("Error uploading gallery media:", err); setMessage(`Failed to upload ${file.name}: ${err.message}`); uploadError = true; break; }
    }
    setUploadingGalleryMedia(false); if (!uploadError) { setCurrentImageGallery(prev => [...prev.split(',').map(u => u.trim()).filter(u => u !== ''), ...uploadedUrls].join(', ')); setMessage('Gallery media uploaded successfully!'); }
  }, [userId, uploadFile]);

  const handleSaveProfile = useCallback(async () => {
    if (!db) { setMessage('Database not initialized. Cannot save profile.'); return; }
    try {
      await updateUserProfile(userId, {
        bio: currentBio.trim(), interests: currentInterests.split(',').map(i => i.trim()).filter(i => i !== ''), location: currentLocation.trim(), photoURL: currentPhotoURL.trim(),
        imageGallery: currentImageGallery.split(',').map(url => url.trim()).filter(url => url !== ''),
        aiBioSummary: FieldValue.delete(), aiInterestAnalysis: FieldValue.delete(), aiConversationStarter: FieldValue.delete(),
      });
      setMessage('Profile updated successfully!'); setEditingProfile(false);
    } catch (e) { console.error("Error updating profile:", e); setMessage(`Failed to update profile: ${e.message}`); }
  }, [currentBio, currentInterests, currentLocation, currentPhotoURL, currentImageGallery, userId, updateUserProfile, db, FieldValue]);

  const handleGenerateBioSuggestion = useCallback(async () => {
    setIsLoadingBioSuggestion(true); setMessage('');
    try {
      const generatedText = await generateContentWithGemini(`Write a short, engaging bio for a persona named "${currentBio}" who is "${profileUser.bio_prompt}". Use high school level vocabulary, sounding like a regular American. Keep it under 150 characters.`);
      if (generatedText) { setCurrentBio(generatedText); setMessage('New bio suggestion generated!'); } else setMessage('Failed to generate bio suggestion. Please try again.');
    } catch (e) { console.error("Error calling Gemini API for bio suggestion:", e); setMessage(`Error generating bio suggestion: ${e.message}`); } finally { setIsLoadingBioSuggestion(false); }
  }, [currentBio, generateContentWithGemini, profileUser.bio_prompt]);

  const aiProfileAnalyze = useCallback(async (type, targetUserId, contentToProcess, setFn, setShowFn, setIsLoadingFn, promptGenerator) => {
    setIsLoadingFn(true); setFn('');
    try {
      const userProfileRef = doc(db, `artifacts/${appId}/public/data/user_profiles`, targetUserId);
      const cachedResult = (await getDoc(userProfileRef)).data()?.[`ai${type}`];
      if (cachedResult) { setFn(cachedResult); setShowFn(true); setMessage(`${type} loaded from cache!`); return; }
      const generatedText = await generateContentWithGemini(promptGenerator(contentToProcess));
      if (generatedText) { await updateDoc(userProfileRef, { [`ai${type}`]: generatedText }); setFn(generatedText); setShowFn(true); setMessage(`${type} generated and cached!`); } else setMessage(`Failed to generate ${type}. Please try again.`);
    } catch (e) { console.error(`Error calling Gemini API for ${type}:`, e); setMessage(`Error generating ${type}: ${e.message}`); } finally { setIsLoadingFn(false); }
  }, [generateContentWithGemini, db, doc, getDoc, updateDoc]);

  const handleSummarizeBio = useCallback((id, bio) => aiProfileAnalyze('BioSummary', id, bio, setBioSummaryResult, setShowBioSummaryModal, setIsLoadingBioSummary, (b) => `Summarize the following user bio concisely (under 50 words), highlighting key aspects. Use simple, everyday language, and make it easy for an average person to understand. Bio: "${b}"`), [aiProfileAnalyze]);
  const handleAnalyzeInterests = useCallback((id, interests) => aiProfileAnalyze('InterestAnalysis', id, interests, setInterestAnalysisResult, setShowInterestAnalysisModal, setIsLoadingInterestAnalysis, (i) => `Analyze the following list of interests and provide a brief insight into the user's potential personality or lifestyle (under 70 words). Use simple, everyday language, and make it easy for an average person to understand. Interests: "${i.join(', ')}"`), [aiProfileAnalyze]);
  const handleSuggestConversationStarter = useCallback((id, bio, interests) => aiProfileAnalyze('ConversationStarter', id, { bio, interests }, setConversationStarterResult, setShowConversationStarterModal, setIsLoadingConversationStarter, (d) => `Given the following user profile (Bio: "${d.bio}", Interests: "${d.interests.join(', ')}"), suggest one friendly and engaging conversation starter that relates to their interests or bio. Make it concise and open-ended. Use simple, everyday language, and make it easy for an average person to understand.`), [aiProfileAnalyze]);

  useEffect(() => {
    if (!isSelf && profileUser?.id && db) {
      const unsub = onSnapshot(query(collection(db, `artifacts/${appId}/public/data/anonymous_entries`), where("authorId", "==", profileUser.id), orderBy("timestamp", "desc"), limit(5)), (snap) => setUserEntries(snap.docs.map(d => ({ id: d.id, ...d.data() }))), (e) => { console.error("Error fetching user's anonymous entries:", e); setMessage(`Error loading user's entries: ${e.message}`); });
      return () => unsub();
    } else setUserEntries([]);
  }, [isSelf, profileUser?.id, db, collection, query, where, orderBy, limit, onSnapshot]);

  const toggleEntryExpansion = useCallback(eId => setExpandedEntries(prev => { const n = new Set(prev); n.has(eId) ? n.delete(eId) : n.add(eId); return n; }), []);

  return (
    <div className="bg-gray-900 bg-opacity-70 p-6 rounded-lg shadow-xl text-center max-w-sm mx-auto text-gray-100 border border-blue-700">
      {message && <MessageBox message={message} onClose={() => setMessage('')} />}
      {showBioSummaryModal && <AIGeneratedContentModal title="Bio Summary" content={bioSummaryResult} onClose={() => setShowBioSummaryModal(false)} LucideIcons={LucideIcons} />}
      {showInterestAnalysisModal && <AIGeneratedContentModal title="Interest Analysis" content={interestAnalysisResult} onClose={() => setShowInterestAnalysisModal(false)} LucideIcons={LucideIcons} />}
      {showConversationStarterModal && <AIGeneratedContentModal title="Conversation Starter" content={conversationStarterResult} onClose={() => setShowConversationStarterModal(false)} LucideIcons={LucideIcons} />}
      <img src={currentPhotoURL || defaultProfileImage} alt={`${profileUser.displayName || 'User'}'s profile`} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-blue-300 shadow-md" />
      <h3 className="text-2xl font-bold text-blue-300 mb-2 font-playfair">{profileUser.displayName || 'Anonymous User'}</h3>
      <p className="text-sm text-gray-300 mb-4">User ID: <span className="font-mono break-all">{profileUser.id}</span></p>
      {isSelf ? (
        <div className="mb-4 text-left">
          {editingProfile ? (<>
            <label htmlFor="profilePhotoUpload" className="block text-gray-200 text-sm font-bold mb-2">Upload Profile Photo:</label>
            <input type="file" ref={profilePhotoInputRef} onChange={handleProfilePhotoUpload} accept="image/*" className="hidden" />
            <button type="button" onClick={() => profilePhotoInputRef.current.click()} className="upload-button" disabled={uploadingProfilePhoto}>{uploadingProfilePhoto ? (<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>) : (<LucideIcons.Upload size={20} />)}<span className="ml-2 text-sm">Upload Photo</span></button>
            {uploadingProfilePhoto && (<div className="w-full bg-gray-200 rounded-full h-2.5 mt-2"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${profilePhotoUploadProgress}%` }}></div></div>)}
            {currentPhotoURL && !uploadingProfilePhoto && (<p className="text-xs text-gray-400 mt-1 truncate">Current: <a href={currentPhotoURL} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{currentPhotoURL}</a></p>)}
            <label htmlFor="userBio" className="block text-gray-200 text-sm font-bold mb-2 mt-3">Your Bio:</label>
            <textarea id="userBio" className="shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-800 bg-opacity-50 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 h-24 resize-y mb-3" value={currentBio} onChange={(e) => setCurrentBio(e.target.value)} maxLength={150}></textarea>
            <p className="text-xs text-gray-400 text-right">{currentBio.length}/150 characters</p>
            <label htmlFor="userInterests" className="block text-gray-200 text-sm font-bold mb-2 mt-3">Interests (comma-separated):</label>
            <input type="text" id="userInterests" className="shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-800 bg-opacity-50 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3" value={currentInterests} onChange={(e) => setCurrentInterests(e.target.value)} placeholder="e.g., reading, hiking, art" />
            <label htmlFor="userLocation" className="block text-gray-200 text-sm font-bold mb-2">Location:</label>
            <input type="text" id="userLocation" className="shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-800 bg-opacity-50 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3" value={currentLocation} onChange={(e) => setCurrentLocation(e.target.value)} placeholder="e.g., New York, USA" />
            <label htmlFor="imageGalleryUpload" className="block text-gray-200 text-sm font-bold mb-2 mt-3">Upload to Image Gallery:</label>
            <input type="file" ref={galleryInputRef} onChange={handleImageGalleryUpload} multiple accept="image/*,video/*" className="hidden" />
            <button type="button" onClick={() => galleryInputRef.current.click()} className="upload-button" disabled={uploadingGalleryMedia}>{uploadingGalleryMedia ? (<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>) : (<LucideIcons.ImagePlus size={20} />)}<span className="ml-2 text-sm">Add to Gallery</span></button>
            {uploadingGalleryMedia && (<div className="w-full bg-gray-200 rounded-full h-2.5 mt-2"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${galleryMediaUploadProgress}%` }}></div></div>)}
            {currentImageGallery && (<div className="mt-2 text-sm text-gray-300">Current Gallery: {currentImageGallery.split(',').map((url, i) => <a key={i} href={url.trim()} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{url.trim()}</a>)}</div>)}
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={handleSaveProfile} className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition duration-300" title="Save profile changes">Save</button>
              <button onClick={() => setEditingProfile(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-300" title="Cancel editing">Cancel</button>
            </div>
            <button onClick={handleGenerateBioSuggestion} disabled={isLoadingBioSuggestion} className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-indigo-400 to-rose-400 text-white font-bold rounded-full hover:from-indigo-500 hover:to-rose-500 transition duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" title="Get an AI-generated bio suggestion">
              {isLoadingBioSuggestion ? (<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>) : (<LucideIcons.Lightbulb size={20} />)}
            </button>
          </>) : (<>
            <p className="text-md text-gray-200 mb-2 italic">Bio: "{profileUser.bio || 'A seeker of harmony and bliss.'}"</p>
            {profileUser.interests?.length > 0 && (<p className="text-sm text-gray-300 mb-2">Interests: {profileUser.interests.join(', ')}</p>)}
            {profileUser.location && (<p className="text-sm text-gray-300 mb-2">Location: {profileUser.location}</p>)}
            <button onClick={() => setEditingProfile(true)} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-300" title="Edit your profile">Edit Profile</button>
          </>)}
        </div>
      ) : (
        <div className="mb-4 text-left">
          <p className="text-md text-gray-200 mb-2 italic">Bio: "{profileUser.bio || 'A seeker of harmony and bliss.'}"</p>
          {profileUser.interests?.length > 0 && (<p className="text-sm text-gray-300 mb-2">Interests: {profileUser.interests.join(', ')}</p>)}
          {profileUser.location && (<p className="text-sm text-gray-300 mb-2">Location: {profileUser.location}</p>)}
          <div className="flex flex-col gap-2 mt-4">
            <button onClick={() => handleSummarizeBio(profileUser.id, profileUser.bio)} disabled={isLoadingBioSummary || !profileUser.bio} className="upload-button" title="Get AI-generated bio summary">{isLoadingBioSummary ? (<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>) : (<LucideIcons.MessageSquareQuote size={20} />)}<span className="ml-2 text-sm">Summarize Bio ✨</span></button>
            <button onClick={() => handleAnalyzeInterests(profileUser.id, profileUser.interests)} disabled={isLoadingInterestAnalysis || !profileUser.interests || profileUser.interests.length === 0} className="upload-button" title="Get AI-generated interest analysis">{isLoadingInterestAnalysis ? (<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>) : (<LucideIcons.TrendingUp size={20} />)}<span className="ml-2 text-sm">Analyze Interests ✨</span></button>
            <button onClick={() => handleSuggestConversationStarter(profileUser.id, profileUser.bio, profileUser.interests)} disabled={isLoadingConversationStarter || (!profileUser.bio && (!profileUser.interests || profileUser.interests.length === 0))} className="upload-button" title="Get AI-generated conversation starter">{isLoadingConversationStarter ? (<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>) : (<LucideIcons.MessageSquarePlus size={20} />)}<span className="ml-2 text-sm">Suggest Conversation Starter ✨</span></button>
          </div>
        </div>
      )}
      {profileUser.imageGallery?.length > 0 && (<div className="mt-4 pt-4 border-t border-gray-700 text-left"><h4 className="text-lg font-semibold mb-3 text-gray-200 font-playfair">Photo Gallery</h4><div className="flex flex-wrap gap-2 justify-center">{profileUser.imageGallery.map((url, i) => (<img key={i} src={url} alt={`Gallery image ${i + 1}`} className="w-20 h-20 object-cover rounded-md shadow-sm" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/AEC6CF/FFFFFF?text=Error"; }} />))}</div></div>)}
      <div className="mt-4 pt-4 border-t border-gray-700 text-left"><h4 className="text-lg font-semibold mb-3 text-gray-200 font-playfair">Engagement</h4><p className="text-sm text-gray-300 flex items-center mb-1"><LucideIcons.TrendingUp size={16} className="mr-2 text-green-400" /> <span>Likes: {profileUser.likesCount || 0}</span></p><p className="text-sm text-gray-300 flex items-center"><LucideIcons.TrendingDown size={16} className="mr-2 text-red-400" /> <span>Dislikes: {profileUser.dislikesCount || 0}</span></p><p className="text-sm text-gray-300 flex items-center mt-1"><LucideIcons.Star size={16} className="mr-2 text-yellow-400" /> <span>Engagement Points: {profileUser.engagementPoints || 0}</span></p></div>
      {!isSelf && user && (<div className="flex flex-col gap-3 mt-4">
        <button onClick={() => onMessageUser(profileUser.id, profileUser.displayName)} className="px-6 py-3 bg-gradient-to-r from-sky-400 to-emerald-500 text-white font-bold rounded-full hover:from-sky-500 hover:to-emerald-600 transition duration-300 transform hover:scale-105 shadow-md" title="Send a private message to this user">Send Private Message</button>
        <button onClick={() => onConnectUser(profileUser.id, isConnected)} className={`px-6 py-3 font-bold rounded-full transition duration-300 transform hover:scale-105 shadow-md ${isConnected ? 'bg-gray-400 text-gray-800 hover:bg-gray-500' : 'bg-purple-500 text-white hover:bg-purple-600'}`} title={isConnected ? 'Disconnect from this user' : 'Connect with this user'}>{isConnected ? 'Connected' : 'Connect'}</button>
      </div>)}
    </div>
  );
}

// Users list component
function UsersList({ onSelectUserForMessage }) {
  const { user, userId, connectUser, disconnectUser, userConnections, db, collection, query, onSnapshot, LucideIcons } = useAppContext();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (!db || !userId) return; // Added userId check
    const unsub = onSnapshot(collection(db, `artifacts/${appId}/public/data/user_profiles`), (snap) => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.id !== userId)), (e) => { console.error("Error listening to user profiles:", e); setMessage(`Real-time update error for users: ${e.message}`); });
    return () => unsub();
  }, [userId, db, collection, onSnapshot]);

  const handleConnect = useCallback(async (targetId, isCon) => {
    if (!user) { setMessage("Please sign in to connect with users."); return; }
    try {
      if (isCon) { await disconnectUser(targetId); setMessage(`Disconnected from user ${targetId}.`); }
      else { await connectUser(targetId); setMessage(`Connected with user ${targetId}!`); }
    } catch (e) { console.error("Error managing connection:", e); setMessage(`Failed to manage connection: ${e.message}`); }
  }, [user, connectUser, disconnectUser]);

  const filteredUsers = useMemo(() => users.filter(u => u.displayName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || (u.interests && u.interests.some(i => i.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))) || (u.location && u.location.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))), [users, debouncedSearchTerm]);

  return (
    <div className="p-6 bg-black bg-opacity-50 rounded-lg shadow-lg max-w-3xl mx-auto text-white">
      {message && <MessageBox message={message} onClose={() => setMessage('')} />}
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-300 font-playfair">Discover Whispers</h2>
      <div className="mb-4"><input type="text" placeholder="Search users by name, interests, or location..." className="shadow appearance-none border rounded-full w-full py-2 px-4 bg-gray-800 bg-opacity-50 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
      {filteredUsers.length === 0 ? (<p className="text-center text-gray-200 text-lg">No other users found yet or no matches for your search.</p>) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(profileUser => (<div key={profileUser.id} className="bg-white bg-opacity-10 p-4 rounded-lg shadow-inner flex flex-col items-center justify-between">
            <UserProfile profileUser={profileUser} onMessageUser={onSelectUserForMessage} onConnectUser={handleConnect} isConnected={userConnections.some(c => c.followingId === profileUser.id)} isSelf={false} />
            <div className="flex justify-end gap-2 mt-4 w-full">
              <button onClick={() => onSelectUserForMessage(profileUser.id, profileUser.displayName)} className="ai-icon-button text-sky-400 hover:bg-sky-100" title="Send private message"><LucideIcons.MessageSquare size={20} /></button>
              <button onClick={() => handleConnect(profileUser.id, userConnections.some(c => c.followingId === profileUser.id))} className={`ai-icon-button ${userConnections.some(c => c.followingId === profileUser.id) ? 'text-gray-400 hover:bg-gray-100' : 'text-purple-400 hover:bg-purple-100'}`} title={userConnections.some(c => c.followingId === profileUser.id) ? 'Disconnect' : 'Connect'}><LucideIcons.HeartHandshake size={20} /></button>
              <button onClick={() => window.location.href = `?page=userProfile&userId=${profileUser.id}`} className="ai-icon-button text-blue-400 hover:bg-blue-100" title="View Profile"><LucideIcons.User size={20} /></button>
            </div>
          </div>))}
        </div>
      )}
    </div>
  );
}

// Connected feed component
function ConnectedFeed() {
  const { user, userId, userConnections, userProfiles, db, collection, query, orderBy, limit, onSnapshot, LucideIcons } = useAppContext();
  const [connectedEntries, setConnectedEntries] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!userId || !userConnections.length || !db) { setConnectedEntries([]); return; }
    const connectedUserIds = userConnections.map(c => c.followingId); if (connectedUserIds.length === 0) { setConnectedEntries([]); return; }
    const unsubscribePromises = connectedUserIds.map(connectedId => onSnapshot(query(collection(db, `artifacts/${appId}/users/${connectedId}/my_entries`), orderBy("timestamp", "desc"), limit(5)), (snap) => setConnectedEntries(prev => { const filtered = prev.filter(e => e.userId !== connectedId); return [...filtered, ...snap.docs.map(d => ({ id: d.id, ...d.data() }))].sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0)); }), (e) => { console.error(`Error listening to entries for connected user ${connectedId}:`, e); setMessage(`Error loading connected feed: ${e.message}`); }));
    return () => unsubscribePromises.forEach(unsub => unsub());
  }, [userId, userConnections, db, collection, query, orderBy, limit, onSnapshot]);

  const getUserDisplayName = useCallback(authorId => userProfiles.find(p => p.id === authorId)?.displayName || 'Unknown User', [userProfiles]);

  if (!user) return (<div className="p-6 bg-white rounded-lg shadow-lg text-center max-w-xl mx-auto"><p className="text-xl text-red-500 font-semibold">Please sign in to view your connected feed.</p></div>);
  return (
    <div className="p-6 bg-black bg-opacity-50 rounded-lg shadow-lg max-w-2xl mx-auto text-white">
      {message && <MessageBox message={message} onClose={() => setMessage('')} />}
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-300 font-playfair">Connected Whispers</h2>
      {connectedEntries.length === 0 ? (<p className="text-center text-gray-200 text-lg">No entries from your connections yet. Connect with more users!</p>) : (
        <div className="space-y-6">
          {connectedEntries.map(e => (<div key={e.id} className="bg-white bg-opacity-10 p-6 rounded-lg shadow-inner border border-gray-700">
            <p className="text-gray-100 text-lg mb-4 italic leading-relaxed"><MarkdownRenderer>{e.content}</MarkdownRenderer></p>
            {e.tags?.length > 0 && (<p className="text-sm text-gray-300 mb-2">Tags: {e.tags.map(t => `#${t}`).join(', ')}</p>)}
            <p className="text-sm text-gray-300 text-right">- {e.isAnonymous ? 'Anonymous' : getUserDisplayName(e.authorId)}{e.userId && ` (User ID: ${e.userId})`}</p>
            <p className="text-xs text-gray-400 text-right">{e.timestamp?.toDate ? e.timestamp.toDate().toLocaleString() : new Date(e.timestamp).toLocaleString()}</p>
          </div>))}
        </div>
      )}
    </div>
  );
}

// Messages component for private chats
function MessagesComponent({ selectedChatUser, onBackToUsers, onSelectUserForMessage }) {
  const { user, userId, generateContentWithGemini, db, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, LucideIcons, appParams, userProfiles } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryResult, setSummaryResult] = useState('');
  const chatSummaryCache = useRef({});

  const getChatId = (uid1, uid2) => [uid1, uid2].sort().join('_');
  const currentChatId = selectedChatUser ? getChatId(userId, selectedChatUser.id) : null;

  useEffect(() => {
    if (!currentChatId || !user || !db) { setMessages([]); return; }
    const unsub = onSnapshot(query(collection(db, `artifacts/${appId}/public/data/chats/${currentChatId}/messages`), orderBy("timestamp")), (snap) => setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() }))), (e) => { console.error("Error listening to messages:", e); setMessage(`Error loading messages: ${e.message}`); });
    return () => unsub();
  }, [currentChatId, user, db, collection, query, orderBy, onSnapshot]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessageText.trim() || !currentChatId || !user || !db) { setMessage('Message cannot be empty or chat not selected or database not initialized.'); return; }
    try {
      // Add user's message
      await addDoc(collection(db, `artifacts/${appId}/public/data/chats/${currentChatId}/messages`), { senderId: userId, senderName: user.displayName || 'Anonymous User', content: newMessageText.trim(), timestamp: serverTimestamp(), });
      setNewMessageText(''); chatSummaryCache.current[currentChatId] = null;

      // Send notification to the other user
      await addDoc(collection(db, `artifacts/${appId}/users/${selectedChatUser.id}/notifications`), { type: 'message', fromUserId: userId, fromUserName: user?.displayName || 'Anonymous User', message: `${user?.displayName || 'Someone'} sent you a message: "${newMessageText.trim().substring(0, 50)}..."`, timestamp: serverTimestamp(), read: false, chatId: currentChatId, senderId: userId, });

      // If chatting with an AI user, get AI response
      const aiUserProfile = userProfiles.find(p => p.id === selectedChatUser.id && p.isAI);
      if (aiUserProfile) {
        const aiUserData = appParams.aiUsersData.find(ai => ai.name === aiUserProfile.displayName);
        if (aiUserData) {
          const aiPrompt = `You are a persona named "${aiUserData.name}" who is "${aiUserData.bio_prompt}". Your interests are ${aiUserData.interests_list.join(', ')}. Your event reaction style is ${aiUserData.event_reaction_style}. Respond to the following message in a concise, natural, and helpful way, maintaining your persona. Use simple, everyday language, and make it easy for an average person to understand. Message: "${newMessageText.trim()}"`;
          const aiResponse = await generateContentWithGemini(aiPrompt);
          if (aiResponse) {
            await addDoc(collection(db, `artifacts/${appId}/public/data/chats/${currentChatId}/messages`), { senderId: aiUserProfile.id, senderName: aiUserProfile.displayName, content: aiResponse, timestamp: serverTimestamp(), isAI: true, });
          } else {
            console.warn("AI failed to generate a response.");
          }
        }
      }

    } catch (e) { console.error("Error sending message:", e); setMessage(`Failed to send message: ${e.message}`); }
  }, [newMessageText, currentChatId, user, userId, selectedChatUser, db, addDoc, collection, serverTimestamp, userProfiles, appParams, generateContentWithGemini]);

  const handleSummarizeChat = useCallback(async () => {
    setIsLoadingSummary(true); setSummaryResult('');
    try {
      if (messages.length === 0) { setMessage('No messages to summarize.'); setIsLoadingSummary(false); return; }
      if (chatSummaryCache.current[currentChatId]) { setSummaryResult(chatSummaryCache.current[currentChatId]); setShowSummaryModal(true); setMessage('Chat summary loaded from cache!'); return; }
      const chatContent = messages.map(msg => `${msg.senderName}: ${msg.content}`).join('\n');
      const generatedText = await generateContentWithGemini(`Summarize the following chat conversation concisely, focusing on key topics and outcomes. Keep it under 100 words. Use simple, everyday language, and make it easy for an average person to understand. Conversation:\n\n${chatContent}`);
      if (generatedText) { chatSummaryCache.current[currentChatId] = generatedText; setSummaryResult(generatedText); setShowSummaryModal(true); setMessage('Chat summary generated and cached!'); } else setMessage('Failed to generate chat summary. Please try again.');
    } catch (e) { console.error("Error calling Gemini API for chat summary:", e); setMessage(`Error generating chat summary: ${e.message}`); } finally { setIsLoadingSummary(false); }
  }, [messages, generateContentWithGemini, currentChatId]);

  if (!user) return (<div className="p-6 bg-white rounded-lg shadow-lg text-center max-w-xl mx-auto"><p className="text-xl text-red-500 font-semibold">Please sign in to view your messages.</p></div>);
  if (!selectedChatUser) return (<div className="p-6 bg-black bg-opacity-50 rounded-lg shadow-lg max-w-2xl mx-auto text-white"><h2 className="text-3xl font-bold text-center mb-6 text-blue-300 font-playfair">Your Conversations</h2><p className="text-center text-gray-200 text-lg mb-4">Select a user from the "Discover Whispers" page to start a private conversation.</p><div className="flex justify-center"><button onClick={onBackToUsers} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full hover:from-purple-600 hover:to-pink-600 transition duration-300 transform hover:scale-105 shadow-lg">Go to Users List</button></div></div>);
  return (
    <div className="p-6 bg-black bg-opacity-50 rounded-lg shadow-lg max-w-2xl mx-auto text-white">
      {message && <MessageBox message={message} onClose={() => setMessage('')} />}
      {showSummaryModal && <AIGeneratedContentModal title="Chat Summary" content={summaryResult} onClose={() => setShowSummaryModal(false)} LucideIcons={LucideIcons} />}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
        <button onClick={onBackToUsers} className="ai-icon-button text-gray-300 hover:bg-gray-700" title="Back to users"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg></button>
        <h2 className="text-2xl font-bold text-blue-300 font-playfair">Chat with {selectedChatUser.displayName}</h2>
        <button onClick={handleSummarizeChat} disabled={isLoadingSummary} className="ai-icon-button text-teal-400 hover:bg-teal-100" title="Summarize chat (AI)">{isLoadingSummary ? (<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-teal-400"></div>) : (<LucideIcons.MessageSquareQuote size={20} />)}</button>
      </div>
      <div className="h-96 overflow-y-auto custom-scrollbar p-4 bg-white bg-opacity-10 rounded-lg shadow-inner mb-4">
        {messages.length === 0 ? (<p className="text-center text-gray-400 italic">Start your conversation!</p>) : (
          messages.map(msg => (<div key={msg.id} className={`mb-3 p-3 rounded-lg max-w-[80%] ${msg.senderId === userId ? 'bg-blue-600 bg-opacity-70 text-white ml-auto rounded-br-none' : 'bg-gray-700 bg-opacity-70 text-gray-100 mr-auto rounded-bl-none'} shadow-md`} >
            <p className="font-semibold text-sm mb-1">{msg.senderName}</p><p className="text-base"><MarkdownRenderer>{msg.content}</MarkdownRenderer></p>
            <p className="text-xs text-gray-300 mt-1 text-right">{msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleString() : new Date(msg.timestamp).toLocaleString()}</p>
          </div>)))}<div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2"><input type="text" value={newMessageText} onChange={(e) => setNewMessageText(e.target.value)} placeholder="Type your message..." className="flex-1 shadow appearance-none border rounded-full py-2 px-4 bg-gray-800 bg-opacity-50 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" /><button onClick={handleSendMessage} className="px-5 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300"><LucideIcons.Send size={20} /></button></div>
    </div>
  );
}

// My profile component
function MyProfile() {
  const { user, userId, userProfiles, updateUserProfile, addFundsToBalance, withdrawEarnings, generateContentWithGemini, db, collection, query, orderBy, limit, getDocs, LucideIcons, auth } = useAppContext();
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [fundAmount, setFundAmount] = useState(10);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsResult, setInsightsResult] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => { if (userId) setProfile(userProfiles.find(p => p.id === userId)); }, [userId, userProfiles]);

  const handleAddFunds = useCallback(async () => {
    if (fundAmount <= 0) { setMessage("Please enter a positive amount to add."); return; }
    try { await addFundsToBalance(userId, fundAmount); setMessage(`Successfully added $${fundAmount.toFixed(2)} to your balance!`); setFundAmount(10); }
    catch (e) { console.error("Error adding funds:", e); setMessage(`Failed to add funds: ${e.message}`); }
  }, [fundAmount, userId, addFundsToBalance]);

  const handleWithdraw = useCallback(async () => {
    if (!profile || profile.earnings <= 0) { setMessage("No earnings to withdraw."); return; }
    try { await withdrawEarnings(userId); setMessage(`Successfully withdrew $${profile.earnings.toFixed(2)}!`); }
    catch (e) { console.error("Error withdrawing earnings:", e); setMessage(`Failed to withdraw earnings: ${e.message}`); }
  }, [profile, userId, withdrawEarnings]);

  const handleGetJournalInsights = useCallback(async () => {
    setIsLoadingInsights(true); setInsightsResult('');
    if (!db) { setMessage('Database not initialized. Cannot generate insights.'); setIsLoadingInsights(false); return; }
    try {
      const recentEntriesContent = (await getDocs(query(collection(db, `artifacts/${appId}/users/${userId}/my_entries`), orderBy("timestamp", "desc"), limit(10)))).docs.map(d => d.data().content).join('\n\n');
      if (!recentEntriesContent.trim()) { setMessage('No recent entries to analyze for insights.'); setIsLoadingInsights(false); return; }
      const userProfileRef = doc(db, `artifacts/${appId}/public/data/user_profiles`, userId);
      const cachedInsights = (await getDoc(userProfileRef)).data()?.aiJournalInsights;
      if (cachedInsights) { setInsightsResult(cachedInsights); setShowInsightsModal(true); setMessage('Journal insights loaded from cache!'); return; }
      const generatedText = await generateContentWithGemini(`Analyze the following collection of journal entries. Identify the overall mood (e.g., "very positive", "neutral", "slightly negative"), dominant emotions (e.g., "joy", "sadness", "calm"), and recurring themes. Provide a concise summary of your findings (under 100 words), starting with "Overall Mood: [Mood]". Use simple, everyday language, and make it easy for an average person to understand. Journal entries:\n\n${recentEntriesContent}`);
      if (generatedText) { await updateDoc(userProfileRef, { aiJournalInsights: generatedText }); setInsightsResult(generatedText); setShowInsightsModal(true); setMessage('Journal insights generated and cached!'); } else setMessage('Failed to generate journal insights. Please try again.');
    } catch (e) { console.error("Error calling Gemini API for journal insights:", e); setMessage(`Error generating insights: ${e.message}`); } finally { setIsLoadingInsights(false); }
  }, [userId, generateContentWithGemini, db, collection, query, orderBy, limit, getDocs, doc, updateDoc]);

  if (!profile) return (<div className="p-6 bg-white rounded-lg shadow-lg text-center max-w-sm mx-auto"><p className="text-lg text-gray-600">Loading your profile...</p></div>);
  return (
    <div className="p-6 bg-gray-900 bg-opacity-70 rounded-lg shadow-xl text-center max-w-sm mx-auto text-gray-100 border border-blue-700">
      <UserProfile profileUser={profile} isSelf={true} updateUserProfile={updateUserProfile} />
      {message && <MessageBox message={message} onClose={() => setMessage('')} />}
      {showInsightsModal && <AIGeneratedContentModal title="Journal Insights" content={insightsResult} onClose={() => setShowInsightsModal(false)} LucideIcons={LucideIcons} />}
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          profile={profile}
          updateUserProfile={updateUserProfile}
          userId={userId}
          db={db}
          LucideIcons={LucideIcons}
          user={user}
          auth={auth}
          addFundsToBalance={addFundsToBalance}
          withdrawEarnings={withdrawEarnings}
        />
      )}

      <div className="mt-6 pt-6 border-t border-gray-200"><h3 className="text-2xl font-bold text-blue-300 font-playfair">My Wallet</h3><p className="text-lg text-gray-100 mb-2">Balance: <span className="font-bold text-emerald-300">${(profile.balance || 0).toFixed(2)}</span></p><p className="text-lg text-gray-100 mb-4">Earnings: <span className="font-bold text-purple-300">${(profile.earnings || 0).toFixed(2)}</span></p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2"><input type="number" value={fundAmount} onChange={(e) => setFundAmount(parseFloat(e.target.value))} min="1" step="1" className="flex-1 shadow appearance-none border rounded-lg py-2 px-3 bg-gray-800 bg-opacity-50 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" /><button onClick={handleAddFunds} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-sky-600 text-white rounded-full hover:from-emerald-600 hover:to-sky-700 transition duration-300" title="Add funds to your wallet">Add Funds</button></div>
          <button onClick={handleWithdraw} disabled={(profile.earnings || 0) <= 0} className="px-6 py-3 bg-gradient-to-r from-indigo-400 to-rose-400 text-white font-bold rounded-full hover:from-indigo-500 hover:to-rose-500 transition duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" title="Withdraw your earnings">Withdraw Earnings</button>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200"><h3 className="text-2xl font-bold text-blue-300 mb-4 font-playfair">Journal Insights</h3>
        <button onClick={() => handleGetJournalInsights()} disabled={isLoadingInsights} className="w-full px-6 py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-bold rounded-full hover:from-teal-500 hover:to-cyan-600 transition duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" title="Get AI-generated insights from your journal entries">
          {isLoadingInsights ? (<div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>) : ('Get Journal Insights ✨')}
        </button>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200"><h3 className="text-2xl font-bold text-blue-300 mb-4 font-playfair">App Settings</h3>
        <button onClick={() => setShowSettingsModal(true)} className="w-full px-6 py-3 bg-gradient-to-r from-emerald-400 to-green-500 text-white font-bold rounded-full hover:from-emerald-500 hover:to-green-600 transition duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center" title="Open application settings">
          <LucideIcons.Settings size={20} className="mr-2" />Open Settings
        </button>
      </div>
    </div>
  );
}

// Notifications component
function NotificationsComponent() {
  const { userId, user, db, collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, LucideIcons } = useAppContext();
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!userId || !db) { setNotifications([]); return; }
    const unsub = onSnapshot(query(collection(db, `artifacts/${appId}/users/${userId}/notifications`), orderBy("timestamp", "desc")), (snap) => setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() }))), (e) => { console.error("Error listening to notifications:", e); setMessage(`Real-time update error for notifications: ${e.message}`); });
    return () => unsub();
  }, [userId, db, collection, query, orderBy, onSnapshot]);

  const handleMarkAsRead = useCallback(async (nId) => {
    if (!db) { setMessage('Database not initialized. Cannot mark as read.'); return; }
    try { await updateDoc(doc(db, `artifacts/${appId}/users/${userId}/notifications`, nId), { read: true }); setMessage('Notification marked as read.'); }
    catch (e) { console.error("Error marking notification as read:", e); setMessage(`Failed to mark as read: ${e.message}`); }
  }, [userId, db, doc, updateDoc]);

  const handleDeleteNotification = useCallback(async (nId) => {
    if (!db) { setMessage('Database not initialized. Cannot delete notification.'); return; }
    try { await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/notifications`, nId)); setMessage('Notification deleted.'); }
    catch (e) { console.error("Error deleting notification:", e); setMessage(`Failed to delete notification: ${e.message}`); }
  }, [userId, db, doc, deleteDoc]);

  if (!user) return (<div className="p-6 bg-white rounded-lg shadow-lg text-center max-w-xl mx-auto"><p className="text-xl text-red-500 font-semibold">Please sign in to view your notifications.</p></div>);
  return (
    <div className="p-6 bg-black bg-opacity-50 rounded-lg shadow-lg max-w-2xl mx-auto text-white">
      {message && <MessageBox message={message} onClose={() => setMessage('')} />}
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-300 font-playfair">Notifications</h2>
      {notifications.length === 0 ? (<p className="text-center text-gray-200 text-lg">No new notifications.</p>) : (
        <div className="space-y-4">
          {notifications.map(n => (<div key={n.id} className={`p-4 rounded-lg shadow-md ${n.read ? 'bg-gray-700 bg-opacity-50' : 'bg-blue-800 bg-opacity-50'} flex justify-between items-center`}>
            <div><p className={`font-semibold ${n.read ? 'text-gray-300' : 'text-white'}`}>{n.message}</p><p className="text-xs text-gray-400 mt-1">{n.timestamp?.toDate ? n.timestamp.toDate().toLocaleString() : new Date(n.timestamp).toLocaleString()}</p></div>
            <div className="flex space-x-2">{!n.read && (<button onClick={() => handleMarkAsRead(n.id)} className="px-3 py-1 bg-green-500 text-white rounded-full text-xs hover:bg-green-600 transition duration-300">Mark Read</button>)}<button onClick={() => handleDeleteNotification(n.id)} className="px-3 py-1 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition duration-300" title="Delete notification">Delete</button></div>
          </div>))}
        </div>
      )}
    </div>
  );
}

// Music Player Component
const MusicPlayer = ({ LucideIcons }) => {
  const audioRef = useRef(null);
  const [volume, setVolume] = useState(0.1); // State for volume, set to 10%
  const [isPlaying, setIsPlaying] = useState(false); // State to track play/pause
  const audioUrl = "https://github.com/Jelani0/WhispersOfHarmony/raw/refs/heads/main/melodyloops-touch-of-hope.mp3"; 

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume; // Set initial volume
      // Attempt to play. This might fail if the browser requires user interaction first.
      audioRef.current.play()
        .then(() => setIsPlaying(true)) // Set playing state if autoplay succeeds
        .catch(e => {
          console.error("Autoplay failed:", e);
          setIsPlaying(false); // Keep paused if autoplay fails, user needs to click
        }); 
    }
  }, []); // Run once on mount

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume; // Update volume when state changes
    }
  }, [volume]);

  const handleVolumeChange = useCallback((e) => {
    setVolume(parseFloat(e.target.value));
    // If user interacts with volume, and audio is paused, try playing
    if (audioRef.current && audioRef.current.paused && !isPlaying) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.error("Play on volume change failed:", e));
    }
  }, [isPlaying]);

  const handlePlayPauseToggle = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => console.error("Manual play failed:", e));
      }
    }
  }, [isPlaying]);

  return (
    <div className="fixed top-4 left-4 p-2 bg-gray-800 bg-opacity-50 rounded-full flex items-center space-x-2 z-50">
      {/* HTML5 Audio tag for direct playback */}
      <audio ref={audioRef} src={audioUrl} loop preload="auto"></audio>
      
      <button onClick={handlePlayPauseToggle} className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white">
        {isPlaying ? <LucideIcons.Pause size={20} /> : <LucideIcons.Play size={20} />}
      </button>

      {/* Volume slider */}
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
        className="w-20 h-1 rounded-lg appearance-none cursor-pointer bg-gray-700 accent-blue-500"
        title="Volume Control"
      />
      <LucideIcons.Volume2 size={16} className="text-gray-400" />
    </div>
  );
};

// Mood Indicator Component
const MoodIndicator = ({ LucideIcons, user, userId, userProfiles, setShowMoodInsightModal, setMoodInsightContent }) => {
  const currentUserProfile = userProfiles.find(p => p.id === userId);
  const latestInsight = currentUserProfile?.aiJournalInsights;

  const getMoodIconAndColor = useCallback(() => {
    if (!latestInsight) {
      return { icon: <LucideIcons.HelpCircle size={20} />, color: 'text-gray-400', tooltip: 'No mood insights yet. Generate from your profile!' };
    }
    
    const lowerInsight = latestInsight.toLowerCase();
    if (lowerInsight.includes('very positive') || lowerInsight.includes('joy') || lowerInsight.includes('optimistic') || lowerInsight.includes('happy')) {
      return { icon: <LucideIcons.Smile size={20} />, color: 'text-green-400', tooltip: 'Overall Mood: Very Positive' };
    } else if (lowerInsight.includes('positive') || lowerInsight.includes('calm') || lowerInsight.includes('peaceful')) {
      return { icon: <LucideIcons.Smile size={20} />, color: 'text-emerald-400', tooltip: 'Overall Mood: Positive' };
    } else if (lowerInsight.includes('neutral') || lowerInsight.includes('reflective') || lowerInsight.includes('balanced')) {
      return { icon: <LucideIcons.Meh size={20} />, color: 'text-yellow-400', tooltip: 'Overall Mood: Neutral' };
    } else if (lowerInsight.includes('slightly negative') || lowerInsight.includes('anxious') || lowerInsight.includes('stressed')) {
      return { icon: <LucideIcons.Frown size={20} />, color: 'text-orange-400', tooltip: 'Overall Mood: Slightly Negative' };
    } else if (lowerInsight.includes('negative') || lowerInsight.includes('sadness') || lowerInsight.includes('unhappy')) {
      return { icon: <LucideIcons.Frown size={20} />, color: 'text-red-400', tooltip: 'Overall Mood: Negative' };
    }
    return { icon: <LucideIcons.HelpCircle size={20} />, color: 'text-gray-400', tooltip: 'Mood insight available, click for details.' };
  }, [latestInsight, LucideIcons]);

  const { icon, color, tooltip } = getMoodIconAndColor();

  const handleClick = useCallback(() => {
    if (latestInsight) {
      setMoodInsightContent(latestInsight);
      setShowMoodInsightModal(true);
    } else {
      // Optionally navigate to MyProfile or show a message
      // For now, just show a message.
      alert('No mood insights available yet. Go to "My Profile" and click "Get Journal Insights" to generate your first mood analysis!');
    }
  }, [latestInsight, setMoodInsightContent, setShowMoodInsightModal]);

  if (!user) {
    return null; // Don't show if user is not signed in
  }

  return (
    <button
      onClick={handleClick}
      className={`fixed top-4 right-4 p-2 rounded-full bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 transition duration-300 hover:bg-gray-700 ${color}`}
      title={tooltip}
      aria-label={tooltip}
    >
      {icon}
    </button>
  );
};

// Settings Modal Component
function SettingsModal({ onClose, profile, updateUserProfile, userId, db, LucideIcons, user, auth }) {
  const [message, setMessage] = useState('');
  const [blockedUserIdInput, setBlockedUserIdInput] = useState('');
  const [notificationSettings, setNotificationSettings] = useState(profile.notificationSettings || { likes: true, comments: true, messages: true, connects: true, });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleToggleNotification = useCallback(async (type) => {
    const newSettings = { ...notificationSettings, [type]: !notificationSettings[type] }; setNotificationSettings(newSettings);
    try { await updateDoc(doc(db, `artifacts/${appId}/public/data/user_profiles`, userId), { notificationSettings: newSettings }); setMessage('Notification settings updated!'); }
    catch (e) { console.error("Error updating notification settings:", e); setMessage(`Failed to update notification settings: ${e.message}`); }
  }, [notificationSettings, userId, db]);

  const handleBlockUser = useCallback(async () => {
    if (!blockedUserIdInput.trim()) { setMessage('Please enter a user ID to block.'); return; } if (blockedUserIdInput.trim() === userId) { setMessage('You cannot block yourself.'); return; }
    try { await updateDoc(doc(db, `artifacts/${appId}/public/data/user_profiles`, userId), { blockedUsers: arrayUnion(blockedUserIdInput.trim()) }); setMessage(`User ${blockedUserIdInput.trim()} blocked.`); setBlockedUserIdInput(''); }
    catch (e) { console.error("Error blocking user:", e); setMessage(`Failed to block user: ${e.message}`); }
  }, [blockedUserIdInput, userId, db]);

  const handleUnblockUser = useCallback(async (idToUnblock) => {
    try { await updateDoc(doc(db, `artifacts/${appId}/public/data/user_profiles`, userId), { blockedUsers: arrayRemove(idToUnblock) }); setMessage(`User ${idToUnblock} unblocked.`); }
    catch (e) { console.error("Error unblocking user:", e); setMessage(`Failed to unblock user: ${e.message}`); }
  }, [userId, db]);

  const confirmDeleteAccount = useCallback(() => setShowConfirmDelete(true), []);

  const handleDeleteAccount = useCallback(async () => {
    setShowConfirmDelete(false);
    if (!user || !db || !auth) { setMessage(`Authentication or database not initialized. Cannot delete account.`); return; }
    try {
      const batch = writeBatch(db);
      const myEntriesQuery = query(collection(db, `artifacts/${appId}/users/${userId}/my_entries`));
      (await getDocs(myEntriesQuery)).docs.forEach(d => batch.delete(doc(db, `artifacts/${appId}/users/${userId}/my_entries`, d.id)));
      const anonymousAuthoredEntriesQuery = query(collection(db, `artifacts/${appId}/public/data/anonymous_entries`), where('authorId', '==', userId));
      (await getDocs(anonymousAuthoredEntriesQuery)).docs.forEach(d => batch.delete(doc(db, `artifacts/${appId}/public/data/anonymous_entries`, d.id)));
      const allPublicEntriesQuery = query(collection(db, `artifacts/${appId}/public/data/anonymous_entries`));
      (await getDocs(allPublicEntriesQuery)).docs.forEach(d => {
        const data = d.data();
        if (data.likes?.includes(userId)) batch.update(doc(db, `artifacts/${appId}/public/data/anonymous_entries`, d.id), { likes: arrayRemove(userId) });
        if (data.dislikes?.includes(userId)) batch.update(doc(db, `artifacts/${appId}/public/data/anonymous_entries`, d.id), { dislikes: arrayRemove(userId) });
        if (data.revealedBy?.includes(userId)) batch.update(doc(db, `artifacts/${appId}/public/data/anonymous_entries`, d.id), { revealedBy: arrayRemove(userId) });
      });
      batch.delete(doc(db, `artifacts/${appId}/public/data/user_profiles`, userId));
      (await getDocs(query(collection(db, `artifacts/${appId}/users/${userId}/connections`)))).docs.forEach(d => batch.delete(doc(db, `artifacts/${appId}/users/${userId}/connections`, d.id)));
      (await getDocs(query(collection(db, `artifacts/${appId}/users/${userId}/notifications`)))).docs.forEach(d => batch.delete(doc(db, `artifacts/${appId}/users/${userId}/notifications`, d.id)));
      await batch.commit(); await user.delete(); setMessage('Account and all associated data deleted successfully!'); onClose();
    } catch (e) { console.error("Error deleting account:", e); setMessage(`Failed to delete account: ${e.message}`); }
  }, [userId, user, db, collection, query, getDocs, doc, deleteDoc, writeBatch, arrayRemove, auth, onClose]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
      {showConfirmDelete && (<MessageBox message="Are you sure you want to delete your account? This action cannot be undone." onClose={() => setShowConfirmDelete(false)} onConfirm={handleDeleteAccount} showConfirm={true} />)}
      <div className="bg-gray-800 bg-opacity-90 p-6 rounded-lg shadow-xl max-w-md w-full text-white relative custom-scrollbar overflow-y-auto max-h-[90vh]">
        <h3 className="text-2xl font-bold mb-4 text-blue-300 font-playfair text-center">Settings</h3>
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition duration-300" aria-label="Close"><LucideIcons.X size={20} /></button>
        {message && <MessageBox message={message} onClose={() => setMessage('')} />}
        <div className="mb-6 pb-4 border-b border-gray-700"><h4 className="text-xl font-semibold mb-3 text-blue-200">Subscription</h4>{profile?.isPremiumSubscriber ? (<p className="text-green-400 font-semibold mb-3">You are a Premium Subscriber!</p>) : (<p className="text-gray-300 mb-3">You are currently on the Free plan.</p>)}<button onClick={profile?.isPremiumSubscriber ? () => setMessage("Subscription management is external.") : () => setMessage("Upgrade functionality coming soon!")} className={`w-full px-4 py-2 font-bold rounded-md transition duration-300 ${profile?.isPremiumSubscriber ? 'bg-gray-600 hover:bg-gray-700' : 'bg-purple-500 hover:bg-purple-600'}`} disabled={profile?.isPremiumSubscriber}>
          {profile?.isPremiumSubscriber ? 'Manage Subscription (External)' : 'Upgrade to Premium'}
        </button></div>
        <div className="mb-6 pb-4 border-b border-gray-700"><h4 className="text-xl font-semibold mb-3 text-blue-200">Notifications</h4><div className="space-y-2">{Object.keys(notificationSettings).map(type => (<div key={type} className="flex items-center justify-between"><label htmlFor={`notify-${type}`} className="text-gray-300 capitalize">{type} Notifications</label><input type="checkbox" id={`notify-${type}`} checked={notificationSettings[type]} onChange={() => handleToggleNotification(type)} className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500" /></div>))}</div></div>
        <div className="mb-6 pb-4 border-b border-gray-700"><h4 className="text-xl font-semibold mb-3 text-blue-200">Blocked Users</h4><div className="flex gap-2 mb-3"><input type="text" placeholder="Enter user ID to block" value={blockedUserIdInput} onChange={(e) => setBlockedUserIdInput(e.target.value)} className="flex-1 shadow appearance-none border rounded-lg py-2 px-3 bg-gray-800 bg-opacity-50 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400" /><button onClick={handleBlockUser} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300">Block</button></div>
          {profile.blockedUsers?.length > 0 ? (<ul className="space-y-1 text-sm text-gray-300">{profile.blockedUsers.map(id => (<li key={id} className="flex justify-between items-center bg-gray-700 p-2 rounded-md"><span className="font-mono break-all">{id}</span><button onClick={() => handleUnblockUser(id)} className="ml-2 px-3 py-1 bg-green-500 text-white rounded-full text-xs hover:bg-green-600 transition duration-300">Unblock</button></li>))}</ul>) : (<p className="text-sm text-gray-400 italic">No users blocked.</p>)}
        </div>
        <div className="mb-6 pb-4 border-b border-gray-700"><h4 className="text-xl font-semibold mb-3 text-blue-200">Privacy</h4><p className="text-gray-300 mb-2">Control who can see your profile and entries.</p><button className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-300">Manage Privacy Settings (Coming Soon)</button></div>
        <div className="mb-6 pb-4 border-b border-gray-700"><h4 className="text-xl font-semibold mb-3 text-blue-200">Appearance</h4><p className="text-gray-300 mb-2">Choose your app's look and feel.</p><button className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 hover:bg-gray-700 transition duration-300">Change Theme (Coming Soon)</button></div>
        <div className="mb-6 pb-4 border-b border-gray-700"><h4 className="text-xl font-semibold mb-3 text-blue-200">About</h4><p className="text-gray-300 text-sm">Whispers of Harmony App</p><p className="text-gray-300 text-sm">Version: 1.0.0</p><p className="text-gray-300 text-sm">Copyright &copy; {new Date().getFullYear()} Health & Legend LLC.</p><p className="text-gray-300 text-sm mt-2">Tech Support: +1 (800) 555-0123 (Placeholder)</p></div>
        <div className="mb-2"><h4 className="text-xl font-semibold mb-3 text-red-400">Danger Zone</h4><button onClick={confirmDeleteAccount} className="w-full px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition duration-300">Delete My Account</button><p className="text-xs text-gray-400 mt-1">This action is irreversible.</p></div>
      </div>
    </div>
  );
}

// Main App component
const App = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [storage, setStorage] = useState(null);
  const [appFunctions, setAppFunctions] = useState(null);
  const [appParams, setAppParams] = useState(null);

  const [message, setMessage] = useState('');
  const getInitialPage = () => { const params = new URLSearchParams(window.location.search); return (params.get('page') === 'userProfile' && params.get('userId')) ? 'userProfile' : 'anonymousFeed'; };
  const [currentPage, setCurrentPage] = useState(getInitialPage());
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [userProfiles, setUserProfiles] = useState([]);
  const [userConnections, setUserConnections] = useState([]);
  const ownerWalletRef = useMemo(() => db ? doc(db, `artifacts/${appId}/public/data/app_metadata/owner_wallet`) : null, [db]);
  const [isGeneratingAIContent, setIsGeneratingAIContent] = useState(false); // New state for AI content generation

  // State for Mood Indicator Modal
  const [showMoodInsightModal, setShowMoodInsightModal] = useState(false);
  const [moodInsightContent, setMoodInsightContent] = useState('');


  useEffect(() => {
    const loadParams = async () => {
      try {
        const params = await fetchAppParameters(); // This is now correctly defined at the top level
        setAppParams(params);
        console.log("App parameters loaded:", params);
      } catch (e) {
        console.error("Failed to load app parameters:", e);
        setMessage("Failed to load application data. Please refresh.");
      }
    };
    loadParams();
  }, []);

  const uploadFile = useCallback(async (file, filePath, onProgress) => {
    if (!storage) throw new Error("Firebase Storage not initialized.");
    return new Promise((res, rej) => {
      const uploadTask = uploadBytesResumable(ref(storage, filePath), file);
      uploadTask.on('state_changed', s => onProgress((s.bytesTransferred / s.totalBytes) * 100), rej, () => getDownloadURL(uploadTask.snapshot.ref).then(res).catch(rej));
    });
  }, [storage]);

  const createUserProfile = useCallback(async (firebaseUser, firestoreDb) => {
    if (!firebaseUser || !firestoreDb) return;
    try { await setDoc(doc(firestoreDb, `artifacts/${appId}/public/data/user_profiles`, firebaseUser.uid), { displayName: firebaseUser.displayName || 'Anonymous User', email: firebaseUser.email || null, photoURL: firebaseUser.photoURL || null, bio: '', interests: [], location: '', balance: 0, earnings: 0, likesCount: 0, dislikesCount: 0, imageGallery: [], createdAt: serverTimestamp(), notificationSettings: { likes: true, comments: true, messages: true, connects: true }, blockedUsers: [], engagementPoints: 0, }, { merge: true }); }
    catch (e) { console.error("Error creating/updating user profile:", e); }
  }, [doc, setDoc, serverTimestamp]);

  const updateUserProfile = useCallback(async (targetId, data) => { if (!targetId || !db) throw new Error("User ID or database not initialized is required to update profile."); await updateDoc(doc(db, `artifacts/${appId}/public/data/user_profiles`, targetId), data); }, [db, doc, updateDoc]);

  const updateUsersBalanceAndEarnings = useCallback(async (targetId, balanceChange, earningsChange) => {
    if (!db) { console.error("Database not initialized. Cannot update user balance and earnings."); return; }
    const userProfileRef = doc(db, `artifacts/${appId}/public/data/user_profiles`, targetId);
    const snap = await getDoc(userProfileRef);
    if (snap.exists()) { await updateDoc(userProfileRef, { balance: (snap.data().balance || 0) + balanceChange, earnings: (snap.data().earnings || 0) + earningsChange, }); }
    else console.warn(`User profile for ${targetId} not found when trying to update balance/earnings.`);
  }, [db, doc, getDoc, updateDoc]);

  const addFundsToBalance = useCallback(async (targetId, amount) => { await updateUsersBalanceAndEarnings(targetId, amount, 0); }, [updateUsersBalanceAndEarnings]);
  const withdrawEarnings = useCallback(async (targetId) => {
    if (!db) { console.error("Database not initialized. Cannot withdraw earnings."); return; }
    const ref = doc(db, `artifacts/${appId}/public/data/user_profiles`, targetId);
    const snap = await getDoc(ref); if (snap.exists() && snap.data().earnings > 0) await updateDoc(ref, { earnings: 0 });
  }, [db, doc, getDoc, updateDoc]);

  const connectUser = useCallback(async (targetId) => {
    if (!userId || !user || !db) throw new Error("User not authenticated or database not initialized to connect.");
    try {
      await setDoc(doc(db, `artifacts/${appId}/users/${userId}/connections`, targetId), { followingId: targetId, timestamp: serverTimestamp(), });
      await addDoc(collection(db, `artifacts/${appId}/users/${targetId}/notifications`), { type: 'connect', fromUserId: userId, fromUserName: user?.displayName || 'Anonymous User', message: `${user?.displayName || 'Someone'} connected with you!`, timestamp: serverTimestamp(), read: false, targetUserId: userId, });
    } catch (e) { console.error("Error connecting:", e); setMessage(`Failed to connect: ${e.message}`); }
  }, [userId, user, db, setDoc, doc, collection, addDoc, serverTimestamp]);

  const disconnectUser = useCallback(async (targetId) => {
    if (!userId || !user || !db) throw new Error("User not authenticated or database not initialized to disconnect.");
    try { await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/connections`, targetId)); setMessage(`Disconnected from user ${targetId}.`); }
    catch (e) { console.error("Error disconnecting:", e); setMessage(`Failed to disconnect: ${e.message}`); }
  }, [userId, user, db, deleteDoc, doc]);

  const generateContentWithGemini = useCallback(async (prompt) => {
    if (!appFunctions) { console.error("Firebase Functions not initialized. Cannot call Gemini API."); return null; }
    try { const result = await httpsCallable(appFunctions, 'generateContent')({ prompt }); return result.data.text; }
    catch (e) { console.error("Error calling Cloud Function for Gemini API:", e); setMessage(`AI generation failed: ${e.code === 'unauthenticated' ? 'You must be signed in to use AI features.' : e.code === 'invalid-argument' ? 'Invalid prompt provided for AI generation.' : e.message}`); return null; }
  }, [appFunctions]);

  const createAIUsersAndEntries = useCallback(async () => {
    setIsGeneratingAIContent(true); // Set loading state
    if (!db || !appParams || !generateContentWithGemini) { console.error("Database, app parameters, or Gemini function not initialized. Cannot create AI users."); setIsGeneratingAIContent(false); return; }
    try {
      if ((await getDoc(doc(db, `artifacts/${appId}/public/data/app_metadata/ai_users_initialized`))).exists()) { console.log("AI users already initialized. Skipping initial creation."); setIsGeneratingAIContent(false); return; }
      for (const aiUserData of appParams.aiUsersData) {
        const aiUserId = `ai-${aiUserData.name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`;
        const generatedBio = await generateContentWithGemini(`Write a short, engaging bio for a persona named "${aiUserData.name}" who is "${aiUserData.bio_prompt}". Use high school level vocabulary, sounding like a regular American. Keep it under 150 characters.`);
        await setDoc(doc(db, `artifacts/${appId}/public/data/user_profiles`, aiUserId), {
          id: aiUserId, displayName: aiUserData.name, email: null, photoURL: `https://api.dicebear.com/7.x/personas/svg?seed=${aiUserData.name.replace(/\s/g, '')}`,
          bio: generatedBio || aiUserData.bio_prompt, interests: aiUserData.interests_list, location: 'AI-World', balance: 0, earnings: 0, likesCount: 0, dislikesCount: 0, imageGallery: [], createdAt: serverTimestamp(), isAI: true, predefinedEntries: aiUserData.predefinedEntries || [], predefinedEntryIndex: 0,
          notificationSettings: { likes: true, comments: true, messages: true, connects: true }, blockedUsers: [], engagementPoints: 0, // Default settings for AI users
        });
      }
      await setDoc(doc(db, `artifacts/${appId}/public/data/app_metadata`, 'ai_users_initialized'), { initialized: true }); console.log("AI users created successfully!");
    } catch (e) { console.error("Failed to create AI users:", e); } finally { setIsGeneratingAIContent(false); } // Reset loading state
  }, [generateContentWithGemini, appParams, db, doc, getDoc, setDoc, serverTimestamp]);

  const postSingleAIEntry = useCallback(async () => {
    if (!db || !appParams || !generateContentWithGemini) { console.error("Database, app parameters, or Gemini function not initialized. Cannot post AI entry."); return; }
    try {
      const aiUsers = (await getDocs(query(collection(db, `artifacts/${appId}/public/data/user_profiles`), where("isAI", "==", true)))).docs.map(d => ({ id: d.id, ...d.data() }));
      if (aiUsers.length === 0) { console.log("No AI users found to post entries."); return; }
      const randomAiUser = aiUsers[Math.floor(Math.random() * aiUsers.length)]; let entryContent = '';
      if (randomAiUser.predefinedEntries?.length > 0 && randomAiUser.predefinedEntryIndex < randomAiUser.predefinedEntries.length) {
        entryContent = randomAiUser.predefinedEntries[randomAiUser.predefinedEntryIndex];
        await updateDoc(doc(db, `artifacts/${appId}/public/data/user_profiles`, randomAiUser.id), { predefinedEntryIndex: randomAiUser.predefinedEntryIndex + 1 });
      } else {
        const randomEvent = appParams.worldEvents[Math.floor(Math.random() * appParams.worldEvents.length)];
        let reactionPrompt = `As a persona named "${randomAiUser.displayName}" who is "${randomAiUser.bio}", react to the following event in a ${randomAiUser.event_reaction_style} tone. Give a short, meaningful opinion on the topic using high school level vocabulary, sounding like a regular American. Event: "${randomEvent}"`;
        if (Math.random() < 0.3) reactionPrompt += " Add a small touch of subtle humor or a witty observation.";
        entryContent = await generateContentWithGemini(reactionPrompt);
      }
      if (entryContent) {
        const entryData = { userId: randomAiUser.id, content: entryContent, timestamp: serverTimestamp(), isAnonymous: true, authorName: randomAiUser.displayName, authorId: randomAiUser.id, tags: randomAiUser.interests, likes: [], dislikes: [], comments: [], revealPrice: Math.floor(Math.random() * 5) + 1, revealedBy: [], mediaUrls: [], isAI: true, likesCount: 0, dislikesCount: 0, };
        await addDoc(collection(db, `artifacts/${appId}/public/data/anonymous_entries`), entryData);
        console.log(`AI user ${randomAiUser.displayName} posted a new entry.`);
        const allEntries = (await getDocs(query(collection(db, `artifacts/${appId}/public/data/anonymous_entries`)))).docs.map(d => ({ id: d.id, ...d.data() }));
        const otherEntries = allEntries.filter(entry => entry.id !== entryData.id && entry.authorId !== randomAiUser.id);

        if (otherEntries.length > 0) {
          const randomAction = Math.random(); const randomOtherEntry = otherEntries[Math.floor(Math.random() * otherEntries.length)];
          const entryRef = doc(db, `artifacts/${appId}/public/data/anonymous_entries`, randomOtherEntry.id);
          const authorRef = doc(db, `artifacts/${appId}/public/data/user_profiles`, randomOtherEntry.authorId);
          if (randomAction < 0.4) { // Like
            if (!randomOtherEntry.likes.includes(randomAiUser.id)) { await updateDoc(entryRef, { likes: arrayUnion(randomAiUser.id), likesCount: FieldValue.increment(1) }); await updateDoc(authorRef, { likesCount: FieldValue.increment(1) }); console.log(`AI user ${randomAiUser.displayName} liked entry ${randomOtherEntry.id}`); }
            if (randomOtherEntry.dislikes.includes(randomAiUser.id)) { await updateDoc(entryRef, { dislikes: arrayRemove(randomAiUser.id), dislikesCount: FieldValue.increment(-1) }); await updateDoc(authorRef, { dislikesCount: FieldValue.increment(-1) }); }
          } else if (randomAction < 0.5) { // Dislike
            if (!randomOtherEntry.dislikes.includes(randomAiUser.id)) { await updateDoc(entryRef, { dislikes: arrayUnion(randomAiUser.id), dislikesCount: FieldValue.increment(1) }); await updateDoc(authorRef, { dislikesCount: FieldValue.increment(1) }); console.log(`AI user ${randomAiUser.displayName} disliked entry ${randomOtherEntry.id}`); }
            if (randomOtherEntry.likes.includes(randomAiUser.id)) { await updateDoc(entryRef, { likes: arrayRemove(randomAiUser.id), likesCount: FieldValue.increment(-1) }); await updateDoc(authorRef, { likesCount: FieldValue.increment(-1) }); }
          }
        }
      }
    } catch (e) { console.error("Error posting AI entry or AI reaction:", e); }
  }, [generateContentWithGemini, appParams, db, collection, query, where, getDocs, doc, updateDoc, addDoc, arrayUnion, arrayRemove, FieldValue, serverTimestamp]);

  const manageAIUsersPeriodically = useCallback(async () => {
    if (!db || !appParams || !generateContentWithGemini) { console.error("Database, app parameters, or Gemini function not initialized. Cannot manage AI users periodically."); return; }
    try {
      const aiUsers = (await getDocs(query(collection(db, `artifacts/${appId}/public/data/user_profiles`), where("isAI", "==", true)))).docs.map(d => ({ id: d.id, ...d.data() }));
      if (aiUsers.length > 0) {
        const aiUserToDelete = aiUsers[Math.floor(Math.random() * aiUsers.length)];
        const batch = writeBatch(db);
        (await getDocs(query(collection(db, `artifacts/${appId}/public/data/anonymous_entries`), where("authorId", "==", aiUserToDelete.id)))).docs.forEach(d => batch.delete(doc(db, `artifacts/${appId}/public/data/anonymous_entries`, d.id)));
        await batch.commit(); console.log(`Deleted all entries by AI user: ${aiUserToDelete.displayName}`);
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/user_profiles`, aiUserToDelete.id)); console.log(`Deleted AI user: ${aiUserToDelete.displayName}`);
      }
      const newAiUserData = appParams.aiUsersData[Math.floor(Math.random() * appParams.aiUsersData.length)];
      const newAiUserId = `ai-${newAiUserData.name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`;
      const generatedBio = await generateContentWithGemini(`Write a short, engaging bio for a persona named "${newAiUserData.name}" who is "${newAiUserData.bio_prompt}". Use high school level vocabulary, sounding like a regular American. Keep it under 150 characters.`);
      const newAiUserProfile = { // Define newAiUserProfile here
        id: newAiUserId, displayName: newAiUserData.name, email: null, photoURL: `https://api.dicebear.com/7.x/personas/svg?seed=${newAiUserData.name.replace(/\s/g, '')}`,
        bio: generatedBio || newAiUserData.bio_prompt, interests: newAiUserData.interests_list, location: 'AI-World', balance: 0, earnings: 0, likesCount: 0, dislikesCount: 0, imageGallery: [], createdAt: serverTimestamp(), isAI: true, predefinedEntries: newAiUserData.predefinedEntries || [], predefinedEntryIndex: 0,
        notificationSettings: { likes: true, comments: true, messages: true, connects: true }, blockedUsers: [], engagementPoints: 0, // Default settings for AI users
      };
      await setDoc(doc(db, `artifacts/${appId}/public/data/user_profiles`, newAiUserId), newAiUserProfile);
      console.log(`Created new AI user: ${newAiUserProfile.displayName}`); // Now accessible
    } catch (e) { console.error("Error managing AI users periodically:", e); }
  }, [generateContentWithGemini, appParams, db, collection, query, where, getDocs, doc, deleteDoc, writeBatch, setDoc, serverTimestamp]);

  useEffect(() => {
    // Determine Firebase config: use Canvas-provided config if available, otherwise a placeholder for local development.
    // IMPORTANT: For local development, replace 'YOUR_FIREBASE_PROJECT_ID' with your actual Firebase project ID.
    // You can find this in your Firebase project settings -> Project settings -> General -> Project ID.
    const firebaseConfig = typeof __firebase_config !== 'undefined'
      ? JSON.parse(__firebase_config)
      : { projectId: 'whispers-of-harmony' }; // Placeholder for local development

    const firebaseApp = initializeApp(firebaseConfig);
    const firestoreDb = getFirestore(firebaseApp); setDb(firestoreDb);
    const firebaseAuth = getAuth(firebaseApp); setAuth(firebaseAuth);
    setStorage(getStorage(firebaseApp)); setAppFunctions(getFunctions(firebaseApp));

    const unsubAuth = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      setUser(currentUser); setUserId(currentUser?.uid || crypto.randomUUID());
      if (currentUser) await createUserProfile(currentUser, firestoreDb);
      setIsAuthReady(true);
    });

    const signInUser = async () => { try { if (initialAuthToken) await signInWithCustomToken(firebaseAuth, initialAuthToken); else await signInAnonymously(firebaseAuth); } catch (e) { console.error("Error during initial Firebase authentication:", e); setMessage(`Authentication Error: ${e.message}. Please try again.`); } };
    signInUser(); return () => unsubAuth();
  }, [initialAuthToken, createUserProfile]);

  useEffect(() => {
    if (!db || !userId || !isAuthReady) { // Added isAuthReady
      console.log("Not fetching user profiles: db, userId, or auth not ready.");
      return;
    }
    const unsub = onSnapshot(collection(db, `artifacts/${appId}/public/data/user_profiles`), (snap) => setUserProfiles(snap.docs.map(d => ({ id: d.id, ...d.data() }))), (e) => { console.error("Error listening to user profiles:", e); setMessage(`Real-time update error for users: ${e.message}`); });
    return () => unsub();
  }, [userId, db, collection, onSnapshot, isAuthReady]); // Added isAuthReady to dependencies

  useEffect(() => {
    if (!db || !userId || !user || !isAuthReady) { // Added isAuthReady
      setUserConnections([]);
      console.log("Not fetching user connections: db, userId, user, or auth not ready.");
      return;
    }
    const unsub = onSnapshot(collection(db, `artifacts/${appId}/users/${userId}/connections`), (snap) => setUserConnections(snap.docs.map(d => ({ id: d.id, ...d.data() }))), (e) => { console.error("Error fetching user connections:", e); setMessage(`Error fetching user connections: ${e.message}`); });
    return () => unsub();
  }, [userId, user, db, collection, onSnapshot, isAuthReady]); // Added isAuthReady to dependencies

  useEffect(() => { if (isAuthReady && db && appParams && appFunctions) createAIUsersAndEntries(); }, [isAuthReady, createAIUsersAndEntries, db, appParams, appFunctions]);

  useEffect(() => {
    let postInterval, manageInterval;
    if (isAuthReady && db && appParams && appFunctions) {
      postSingleAIEntry(); postInterval = setInterval(() => postSingleAIEntry(), 120000);
      manageAIUsersPeriodically(); manageInterval = setInterval(() => manageAIUsersPeriodically(), 300000);
    }
    return () => { if (postInterval) clearInterval(postInterval); if (manageInterval) clearInterval(manageInterval); };
  }, [isAuthReady, postSingleAIEntry, manageAIUsersPeriodically, db, appParams, appFunctions]);

  const signInWithGoogle = useCallback(async () => { if (!auth) { setMessage("Authentication service not initialized."); throw new Error("Authentication service not initialized."); } return await signInWithPopup(auth, new GoogleAuthProvider()); }, [auth]);
  const signOutUser = useCallback(async () => { if (!auth) { setMessage("Authentication service not initialized."); throw new Error("Authentication service not initialized."); } await signOut(auth); }, [auth]);

  const handleSelectUserForMessage = useCallback((targetId, targetName) => { setSelectedChatUser({ id: targetId, displayName: targetName }); setCurrentPage('messages'); }, []);
  const handleBackToUsers = useCallback(() => { setSelectedChatUser(null); setCurrentPage('users'); }, []);
  const handlePageChange = useCallback((newPage) => { if (!user && newPage !== 'anonymousFeed') { setMessage('Please sign in to access this page.'); setCurrentPage('anonymousFeed'); } else setCurrentPage(newPage); }, [user, setMessage, setCurrentPage]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page'); const targetId = params.get('userId');
    if (page === 'userProfile' && targetId) {
      // Only attempt to set selectedChatUser and currentPage if auth is ready and profiles are loaded
      if (isAuthReady && userProfiles.length > 0) {
        const profile = userProfiles.find(p => p.id === targetId);
        if (profile) {
          setSelectedChatUser(profile);
          setCurrentPage('userProfile');
        } else {
          // If profile not found, default to anonymous feed
          setCurrentPage('anonymousFeed');
        }
      }
    }
  }, [userProfiles, isAuthReady]); // Added isAuthReady to dependencies

  if (!appParams) return <LoadingSpinner message="Loading application data..." />;

  return (
    <AppContext.Provider value={{
      user, userId, signInWithGoogle, signOutUser, createUserProfile, updateUserProfile, connectUser, disconnectUser, userProfiles, userConnections,
      updateUsersBalanceAndEarnings, ownerWalletRef, addFundsToBalance, withdrawEarnings, generateContentWithGemini, db, auth, storage, appParams, appFunctions,
      getDoc, collection, addDoc, query, where, getDocs, onSnapshot, doc, deleteDoc, updateDoc, setDoc, arrayUnion, arrayRemove, orderBy, limit, startAfter, writeBatch, FieldValue, serverTimestamp, uploadFile, LucideIcons,
      setShowMoodInsightModal, setMoodInsightContent // Pass down mood insight state setters
    }}>
      <div className="min-h-screen bg-cover bg-fixed font-lora text-gray-800 p-4 sm:p-8 relative" style={{ backgroundImage: 'url("https://i.postimg.cc/vHhqVDns/Untitled.gif")', backgroundSize: 'cover', backgroundPosition: 'center', }}>
        <MusicPlayer LucideIcons={LucideIcons} />
        {user && userId && ( // Only render mood indicator if user is signed in
          <MoodIndicator
            LucideIcons={LucideIcons}
            user={user}
            userId={userId}
            userProfiles={userProfiles}
            setShowMoodInsightModal={setShowMoodInsightModal}
            setMoodInsightContent={setMoodInsightContent}
          />
        )}
        {showMoodInsightModal && (
          <AIGeneratedContentModal
            title="Your Journal Mood Insights"
            content={moodInsightContent}
            onClose={() => setShowMoodInsightModal(false)}
            LucideIcons={LucideIcons}
          />
        )}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
          body { font-family: 'Lora', serif; } h1, h2, h3 { font-family: 'Playfair Display', serif; }
          .cloud-button { background-image: linear-gradient(to right, #AEC6CF, #87CEEB); border-radius: 0; padding: 0.5rem 0.6rem; font-weight: 600; color: white; box-shadow: none; transition: all 0.3s ease; transform: scale(1); flex-grow: 1; flex-shrink: 1; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 60px; border-right: 1px solid rgba(255, 255, 255, 0.2); }
          .cloud-button:last-child { border-right: none; } .cloud-button:hover { transform: scale(1.02); background-image: linear-gradient(to right, #87CEEB, #6495ED); } .cloud-button:active { transform: scale(0.98); }
          .ai-icon-button { width: 40px; height: 40px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; background-color: transparent; transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out; box-shadow: none; border: none; cursor: pointer; }
          .ai-icon-button:hover { transform: scale(1.1); } .ai-icon-button:active { transform: scale(0.95); } .ai-icon-button:disabled { opacity: 0.5; cursor: not-allowed; }
          .upload-button { background-color: #6366F1; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; transition: background-color 0.3s ease, transform 0.2s ease; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .upload-button:hover { background-color: #4F46E5; transform: translateY(-2px); } .upload-button:active { transform: translateY(0); box-shadow: none; } .upload-button:disabled { opacity: 0.6; cursor: not-allowed; }
          .custom-scrollbar::-webkit-scrollbar { width: 8px; } .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
          .bottom-nav-panel { border-radius: 0.75rem 0.75rem 0 0; box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
          @media (max-width: 640px) { .bottom-nav-flex { padding: 0.5rem 0; } .cloud-button { padding: 0.4rem 0.2rem; font-size: 0.65rem; min-width: 40px; } .cloud-button svg { width: 16px; height: 16px; } }
          @keyframes pulse-slow {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.01); }
          }
          .animate-pulse-slow {
            animation: pulse-slow 3s infinite ease-in-out;
          }
        `}</style>
        <header className="text-center mb-10 relative z-10"><h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg font-playfair">Whispers of Harmony</h1><p className="text-xl text-blue-200 italic drop-shadow-md">Connecting souls, inspiring bliss.</p></header>
        <main className="max-w-4xl mx-auto pb-20 relative z-10">
          {currentPage === 'anonymousFeed' && <AnonymousFeed />}
          {currentPage === 'newEntry' && <JournalEntryForm />}
          {currentPage === 'myEntries' && <MyEntries />}
          {currentPage === 'users' && <UsersList onSelectUserForMessage={handleSelectUserForMessage} />}
          {currentPage === 'connectedFeed' && user && userId && <ConnectedFeed />}
          {currentPage === 'messages' && user && userId && (<MessagesComponent selectedChatUser={selectedChatUser} onBackToUsers={handleBackToUsers} onSelectUserForMessage={handleSelectUserForMessage} />)}
          {currentPage === 'myProfile' && user && userId && <MyProfile />}
          {currentPage === 'userProfile' && selectedChatUser && (<UserProfile profileUser={selectedChatUser} isSelf={selectedChatUser.id === userId} onMessageUser={handleSelectUserForMessage} onConnectUser={() => { /* Handled by UserProfile internally */ }} isConnected={userConnections.some(c => c.followingId === selectedChatUser.id)} />)}
          {currentPage === 'notifications' && <NotificationsComponent />}
        </main>
        <nav className="fixed bottom-0 left-0 right-0 w-full bg-white bg-opacity-90 backdrop-blur-sm p-0 flex flex-row flex-nowrap justify-between items-center z-50 border-t border-gray-200 sm:p-0 bottom-nav-flex bottom-nav-panel">
          <button onClick={() => handlePageChange('anonymousFeed')} className={`cloud-button ${currentPage === 'anonymousFeed' ? 'bg-blue-700' : ''}`}><LucideIcons.Feather size={20} /><span className="text-xs mt-1">Feed</span></button>
          <button onClick={() => handlePageChange('newEntry')} className={`cloud-button ${currentPage === 'newEntry' ? 'bg-blue-700' : ''}`}><LucideIcons.Plus size={20} /><span className="text-xs mt-1">New Entry</span></button>
          <button onClick={() => handlePageChange('myEntries')} className={`cloud-button ${currentPage === 'myEntries' ? 'bg-blue-700' : ''}`}><LucideIcons.Book size={20} /><span className="text-xs mt-1">My Entries</span></button>
          <button onClick={() => handlePageChange('users')} className={`cloud-button ${currentPage === 'users' ? 'bg-blue-700' : ''}`}><LucideIcons.Users size={20} /><span className="text-xs mt-1">Users</span></button>
          {user && (<button onClick={() => handlePageChange('connectedFeed')} className={`cloud-button ${currentPage === 'connectedFeed' ? 'bg-blue-700' : ''}`}><LucideIcons.HeartHandshake size={20} /><span className="text-xs mt-1">Connected</span></button>)}
          {user && (<button onClick={() => handlePageChange('messages')} className={`cloud-button ${currentPage === 'messages' ? 'bg-blue-700' : ''}`}><LucideIcons.MessageSquare size={20} /><span className="text-xs mt-1">Messages</span></button>)}
          {user && (<button onClick={() => handlePageChange('notifications')} className={`cloud-button ${currentPage === 'notifications' ? 'bg-blue-700' : ''}`}><LucideIcons.Bell size={20} /><span className="text-xs mt-1">Notifications</span></button>)}
          {user && (<button onClick={() => handlePageChange('myProfile')} className={`cloud-button ${currentPage === 'myProfile' ? 'bg-blue-700' : ''}`}><LucideIcons.UserCircle size={20} /><span className="text-xs mt-1">Profile</span></button>)}
          <AuthButton setCurrentPage={handlePageChange} />
        </nav>
        <footer className="text-center mt-10 text-gray-700 text-sm relative z-10"><p>&copy; {new Date().getFullYear()} Health & Legend LLC. All rights reserved.</p></footer>
      </div>
    </AppContext.Provider>
  );
};

export default App;
