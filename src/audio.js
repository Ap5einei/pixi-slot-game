class AudioManager {
    constructor() {
        this.sounds = {};
        this.muted = false;
        this.volume = 0.5;
    }
    
    load(name, src) {
        const audio = new Audio(src);
        audio.volume = this.volume;
        this.sounds[name] = audio;
    }
    
    play(name) {
        if (this.muted || !this.sounds[name]) return;
        
        const sound = this.sounds[name];
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
    
    playLoop(name) {
        if (this.muted || !this.sounds[name]) return;
        
        const sound = this.sounds[name];
        sound.loop = true;
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
    
    stop(name) {
        if (!this.sounds[name]) return;
        
        const sound = this.sounds[name];
        sound.pause();
        sound.currentTime = 0;
        sound.loop = false;
    }
    
    stopAll() {
        Object.keys(this.sounds).forEach(name => this.stop(name));
    }
    
    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopAll();
        }
        return this.muted;
    }
    
    setVolume(volume) {
        this.volume = volume;
        Object.values(this.sounds).forEach(sound => {
            sound.volume = volume;
        });
    }
}

export const audioManager = new AudioManager();
