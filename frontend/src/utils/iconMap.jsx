import React from 'react';
import { 
    Book, Video, Heart, Star, Sword, Shield, Zap, Skull, 
    Ghost, Smile, Frown, User, Home, Music, Image, 
    Bookmark, Tag, Flag, AlertCircle, CheckCircle, 
    Flame, Droplet, Sun, Moon, Cloud
} from 'lucide-react';

// The centralized map of available icons
export const ICON_MAP = {
    "book": Book,
    "video": Video,
    "heart": Heart,
    "star": Star,
    "sword": Sword,
    "shield": Shield,
    "magic": Zap,
    "skull": Skull,
    "ghost": Ghost,
    "smile": Smile,
    "frown": Frown,
    "character": User,
    "home": Home,
    "music": Music,
    "image": Image,
    "bookmark": Bookmark,
    "tag": Tag,
    "flag": Flag,
    "alert": AlertCircle,
    "check": CheckCircle,
    "fire": Flame,
    "water": Droplet,
    "sun": Sun,
    "moon": Moon,
    "cloud": Cloud
};

// Helper to render an icon by string name
export const renderIcon = (iconName, props = {}) => {
    const IconComponent = ICON_MAP[iconName] || Tag; // Default to 'Tag' icon if not found
    return <IconComponent {...props} />;
};

// Get list of keys for the picker
export const iconKeys = Object.keys(ICON_MAP);