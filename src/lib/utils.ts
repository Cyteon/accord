export function generateTimeString(date: String): string {
    const obj = new Date(date);
    const diff = (new Date().getTime() - obj.getTime()) / 1000;
    
    if (diff == 0) {
        return 'just now';
    } else if (diff < 60) {
        return `${Math.floor(diff)} seconds ago`;
    } else if (diff / 60 < 60) {
        return `${Math.floor(diff / 60)} minutes ago`;
    } else if (diff / 60 / 60 < 24) {
        return `${Math.floor(diff / 3600)} hours ago`;
    } else if (diff / 60 / 60 / 24 < 30) {
        return `${Math.floor(diff / 86400)} days ago`;
    }
}