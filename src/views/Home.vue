<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from 'vue-router';

export default {
  name: "Home",

  setup() {
    const router = useRouter();
    const photos = ref([]);
    const loading = ref(true);
    const searchQuery = ref("");
    const selectedPhoto = ref(null);
    const loadedImages = ref(new Set());
    const clientId = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
    const baseUrl = import.meta.env.VITE_BASE_URL;

    const firstThreeStyles = [
      { height: 400, overlap: true, infoPosition: "bottom" },
      { height: 500, overlap: true, infoPosition: "bottom" }, 
      { height: 400, overlap: true, infoPosition: "bottom" }, 
    ];

    const repeatablePattern = [
      { height: 400, overlap: false, infoPosition: "first" }, 
      { height: 450, overlap: false, infoPosition: "center" },
      { height: 400, overlap: false, infoPosition: "first" }, 
    ];

    const getStyleClass = (index) => {
      let style;

      if (index < 3) {
        style = firstThreeStyles[index];
      } else {
        const repeatIndex = (index - 3) % repeatablePattern.length;
        style = repeatablePattern[repeatIndex];
      }

      return {
        overlap: style.overlap,
        [`height-${style.height}`]: true,
        [`info-${style.infoPosition}`]: true,
      };
    };

    const fetchPhotos = async (query = "") => {
      loading.value = true;
      try {
        const response = await axios.get(`${baseUrl}/search/photos`, {
          params: {
            client_id: clientId,
            query: "african" || null,
            per_page: 14,
            order_by: "latest"
          },
        });

        photos.value = response.data.results.map((photo) => ({
          id: photo.id,
          author: photo.user.name,
          location: photo.user.location || "Unknown location",
          url: photo.urls.regular,
        }));

      } catch (error) {
        console.error("Error fetching photos:", error);
      } finally {
        loading.value = false;
      }
    };

    const goToSearchResult = () => {
      if (searchQuery.value.trim()) {
        router.push({
          name: 'SearchResult', 
          query: { q: searchQuery.value }
        });
      }
    };


    const openModal = (photo) => {
      selectedPhoto.value = photo;
      document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
      selectedPhoto.value = null;
      document.body.style.overflow = "";
    };

    const onImageLoad = (index) => {
      loadedImages.value.add(index);
    };

    onMounted(() => {
      fetchPhotos();
    });

    return {
      photos,
      loading,
      searchQuery,
      getStyleClass,
      selectedPhoto,
      openModal,
      closeModal,
      onImageLoad,
      goToSearchResult
    };
  },
};
</script>

<template>
  <div class="photo-grid">
    <div class="search-container">
      <div class="search-wrapper">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search for photo"
          @keyup.enter="goToSearchResult"
        />
        <span class="search-icon">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5043 12.7364L11.2128 10.4959L11.159 10.4142C11.0592 10.3148 10.9226 10.2588 10.7801 10.2588C10.6376 10.2588 10.501 10.3148 10.4011 10.4142C8.45364 12.2009 5.45275 12.298 3.38865 10.6412C1.32456 8.98431 0.837763 6.08761 2.25111 3.87214C3.66445 1.65668 6.53937 0.809929 8.96922 1.89346C11.3991 2.97698 12.6299 5.65456 11.8453 8.15043C11.7888 8.33073 11.835 8.52682 11.9665 8.66481C12.0979 8.8028 12.2947 8.86174 12.4827 8.81942C12.6706 8.77711 12.8212 8.63997 12.8777 8.45966C13.8156 5.49779 12.3991 2.3104 9.54473 0.959403C6.69031 -0.391594 3.25454 0.499247 1.46002 3.05564C-0.334502 5.61204 0.0507704 9.0668 2.36661 11.185C4.68244 13.3033 8.23384 13.4493 10.7234 11.5286L12.7524 13.5124C12.962 13.7164 13.3008 13.7164 13.5103 13.5124C13.7197 13.3055 13.7197 12.9724 13.5103 12.7656L13.5043 12.7364Z" fill="#667085"/>
            </svg>

        </span>
      </div>
    </div>

    <div class="grid-container">
      <transition-group name="photo-fade" tag="div" class="photo-layout">
        <template v-if="loading">
          <div
            v-for="n in 6"
            :key="`skeleton-${n}`"
            class="photo-card skeleton"
            :class="{ overlap: n <= 3 }"
          >
          <div class="skeleton-content">
              <div class="skeleton-text"></div>
              <div class="skeleton-text2"></div>
            </div>
          </div>
        </template>
        <template v-else>
          <div
            v-for="(photo, index) in photos"
            :key="photo.id"
            class="photo-card"
            :class="getStyleClass(index)"
            @click="openModal(photo)"
          >
            <div class="image-container">
              <img :src="photo.url" :alt="photo.author" />
              <div class="overlay"></div>
              <div class="photo-info">
                <h3>{{ photo.author }}</h3>
                <p>{{ photo.location }}</p>
              </div>
            </div>
          </div>
        </template>
      </transition-group>
    </div>

    <teleport to="body">
      <div v-if="selectedPhoto" class="modal" @click.self="closeModal">
        <div class="modal-content">
          <img :src="selectedPhoto.url" :alt="selectedPhoto.author" />
          <div class="modal-info">
            <h2>{{ selectedPhoto.author }}</h2>
            <p>{{ selectedPhoto.location }}</p>
          </div>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style lang="scss" scoped>
.photo-grid {
  min-width: 1400px;
  margin: 0 auto;
}

.search-container {
background: #ecf3f6;
  height: 180px;
  width: 100%;
  position: relative;
  margin-bottom: 40px;

  .search-wrapper {
    position: absolute;
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 600px;

    input {
    position: relative;
      width: 100%;
      padding: 15px 45px;
      border: none;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      font-size: 16px;
      outline: none;
    }

    .search-icon {
        position: absolute;
      top: 15px;
      left: 20px
    }
  }
}

.grid-container {
  padding: 0 20px;

  .photo-layout {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 40px;
    max-width: 1000px;
    margin: 0 auto;
  }
}

.photo-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;

  &.height-400 {
    height: 400px;
  }
  &.height-450 {
    height: 450px;
  }
  &.height-500 {
    height: 500px;
  }

  &.overlap {
    margin-top: -80px;
  }

  &:hover {
    transform: scale(1.03);
  }

  .image-container {
    position: relative;
    height: 100%;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
    }

    .photo-info {
      position: absolute;
      left: 20px;
      color: white;
      z-index: 1;

      h3 {
        margin: 0 0 5px;
        font-size: 18px;
        font-weight: 500;
      }

      p {
        margin: 0;
        font-size: 14px;
        opacity: 0.8;
      }
    }
  }

  &.info-bottom {
    margin-bottom: 20px;
  }

  &.info-bottom .photo-info {
    bottom: 20px;
  }

  &.info-first {
    top: -100px;
    bottom: 0;
  }

  &.info-first .photo-info {
    bottom: 20px;
  }

  &.info-center .photo-info {
    bottom: 20px;
  }
}

.skeleton {
  .skeleton-content {
    height: 100%;
    height: 450px;
    background: whitesmoke;
    background-size: 200% 100%;
    animation: skeleton-loading 2.5s infinite;
  }

  .skeleton-text {
    height: 7px;
    width: 14rem;
    background: rgb(209, 209, 209);
    position: absolute;
    bottom: 20px;
    margin-left: 20px;
  }

  .skeleton-text2 {
    height: 7px;
    width: 10rem;
    background: rgb(209, 209, 209);
    margin-bottom: 20px;
    position: absolute;
    bottom: 20px;
    margin-left: 20px;
  }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .modal-content {
    max-width: 100%;
    max-height: 90%;
    background: white;
    border-radius: var(--border-radius);
    overflow: hidden;
    position: relative;
    border-radius: 16px;
    padding-bottom: 20px;
    
    img {
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
    }
    
    .modal-info {
      margin-left: 40px;
      margin-top: 20px;
    }

    .close-button {
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: white;
    }
  }
}


.photo-fade-enter-active,
.photo-fade-leave-active {
  transition: opacity var(--transition-duration);
}

.photo-fade-enter-from,
.photo-fade-leave-to {
  opacity: 0;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 768px) {
    .grid-container {
  padding: 0px;

  .photo-layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 40px;
    max-width: 1000px;
    margin: 0 auto;
  }
}
}


@media (max-width: 300px) {
    .grid-container {
  padding: 0px;

  .photo-layout {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 40px;
    // max-width: 1000px;
    margin: 0 auto;
  }
}
 
}

</style>
