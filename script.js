// 1. Initial Mock Database + Local Storage check
const defaultVideos = [
    { id: 1, title: "Elephant Dream", url: "https://w3schools.com", thumb: "https://picsum.photos", likes: 89, views: "1.2K views" },
    { id: 2, title: "Big Buck Bunny", url: "https://w3schools.com", thumb: "https://picsum.photos", likes: 124, views: "5.4K views" }
];

// Load existing videos from Local Storage, or fall back to defaults
let videoDatabase = JSON.parse(localStorage.getItem("sim_videos")) || defaultVideos;

// 2. DOM Elements
const feedContainer = document.getElementById("video-feed");
const uploadNavBtn = document.getElementById("upload-nav-btn");
const uploadModal = document.getElementById("upload-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const submitVideoBtn = document.getElementById("submit-video-btn");

// 3. Render the Feed
function loadFeed() {
    feedContainer.innerHTML = "";
    videoDatabase.forEach(video => {
        const card = document.createElement("div");
        card.className = "thumbnail-card";
        card.innerHTML = `
            <img src="${video.thumb || 'https://picsum.photos'}" alt="Thumbnail">
            <div>
                <h4>${video.title}</h4>
                <p style="font-size:12px; color:#aaa;">${video.views || '0 views'}</p>
            </div>
        `;
        card.addEventListener("click", () => playVideo(video));
        feedContainer.appendChild(card);
    });
}

// 4. Modal Toggle Logic
uploadNavBtn.addEventListener("click", () => uploadModal.classList.remove("hidden"));
closeModalBtn.addEventListener("click", () => uploadModal.classList.add("hidden"));

// 5. Handle Video Upload/Posting
submitVideoBtn.addEventListener("click", () => {
    const title = document.getElementById("new-title").value;
    const url = document.getElementById("new-url").value;
    const thumb = document.getElementById("new-thumb").value;

    if (!title || !url) {
        alert("Please fill out the Title and Video URL fields!");
        return;
    }

    // Create new video object
    const newVideo = {
        id: Date.now(), // Unique ID
        title: title,
        url: url,
        thumb: thumb,
        likes: 0,
        views: "0 views"
    };

    // Add to array, save to local storage, reset form and refresh feed
    videoDatabase.unshift(newVideo); // Adds new video to the top of the feed
    localStorage.setItem("sim_videos", JSON.stringify(videoDatabase));
    
    // Clear fields & close
    document.getElementById("new-title").value = "";
    document.getElementById("new-url").value = "";
    document.getElementById("new-thumb").value = "";
    uploadModal.classList.add("hidden");

    loadFeed(); // Refresh the list view
});

// Initialize feed on load
loadFeed();
