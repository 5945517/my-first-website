require("dotenv").config();
const express=require("express"), path=require("path");
const app=express(), PORT=process.env.PORT||3000;
app.use(express.json()); app.use(express.static(path.join(__dirname,"public")));
const clean=s=>String(s||"").trim().slice(0,180);
function recommendationQuery({q,language,genre,artist,mode}){
  const a=[q,language,genre,artist].filter(Boolean);
  const m={mood:"calm",occasion:"dinner",purpose:"study"};
  if(mode&&m[mode])a.push(m[mode]);
  return a.join(" ")||"instrumental music";
}
async function spotifyToken(){
  if(!process.env.SPOTIFY_CLIENT_ID||!process.env.SPOTIFY_CLIENT_SECRET)return null;
  const c=Buffer.from(process.env.SPOTIFY_CLIENT_ID+":"+process.env.SPOTIFY_CLIENT_SECRET).toString("base64");
  const r=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{Authorization:"Basic "+c,"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=client_credentials"});
  if(!r.ok)throw Error("Spotify token error: "+r.status); return (await r.json()).access_token;
}
async function spotify(q){
  const token=await spotifyToken();
  if(!token)return {source:"Spotify",configured:false,items:[],message:"請在 .env 設定 Spotify Client ID / Secret。"};
  const p=new URLSearchParams({q,type:"track",market:"TW",limit:"10"});
  const r=await fetch("https://api.spotify.com/v1/search?"+p,{headers:{Authorization:"Bearer "+token}});
  if(!r.ok)throw Error("Spotify search error: "+r.status);
  const d=await r.json();
  return {source:"Spotify",configured:true,items:(d.tracks?.items||[]).map(t=>({id:t.id,title:t.name,artist:t.artists?.map(a=>a.name).join(", "),image:t.album?.images?.[1]?.url||"",url:t.external_urls?.spotify,license:"Spotify catalog",downloadable:false}))};
}
async function youtube(q){
  if(!process.env.YOUTUBE_API_KEY)return {source:"YouTube",configured:false,items:[],message:"請在 .env 設定 YouTube API key。"};
  const p=new URLSearchParams({part:"snippet",q,type:"video",videoCategoryId:"10",videoEmbeddable:"true",maxResults:"10",regionCode:"TW",key:process.env.YOUTUBE_API_KEY});
  const r=await fetch("https://www.googleapis.com/youtube/v3/search?"+p);
  if(!r.ok)throw Error("YouTube search error: "+r.status);
  const d=await r.json();
  return {source:"YouTube",configured:true,items:(d.items||[]).map(v=>({id:v.id.videoId,title:v.snippet.title,artist:v.snippet.channelTitle,image:v.snippet.thumbnails?.high?.url||"",url:"https://www.youtube.com/watch?v="+v.id.videoId,embed:"https://www.youtube.com/embed/"+v.id.videoId,license:"Check on YouTube",downloadable:false}))};
}
async function openverse(q){
  const p=new URLSearchParams({q,category:"music",page_size:"10"});
  const r=await fetch("https://api.openverse.org/v1/audio/?"+p);
  if(!r.ok)throw Error("Openverse error: "+r.status);
  const d=await r.json();
  return {source:"Openverse",configured:true,items:(d.results||[]).map(x=>({id:x.id||x.url,title:x.title||"Untitled",artist:x.creator||"Unknown creator",url:x.url||x.foreign_landing_url||x.detail_url,sourceUrl:x.foreign_landing_url||x.detail_url,license:x.license||"Check source",provider:x.provider_name||"",downloadable:Boolean(x.url)}))};
}
app.get("/api/search",async(req,res)=>{
  try{
    const input={q:clean(req.query.q),language:clean(req.query.language),genre:clean(req.query.genre),artist:clean(req.query.artist),mode:clean(req.query.mode)};
    const query=recommendationQuery(input);
    const [s,y,o]=await Promise.all([spotify(query),youtube(query),openverse(query)]);
    res.json({query,recommendationReason:input.mode?("依照「"+input.mode+"」情境，加上語言、曲風、歌手與搜尋詞進行跨平台搜尋。"):"依照語言、曲風、歌手與搜尋詞進行跨平台搜尋。",spotify:s,youtube:y,openverse:o});
  }catch(e){console.error(e);res.status(500).json({error:e.message});}
});
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log("Musica running at http://localhost:"+PORT));
