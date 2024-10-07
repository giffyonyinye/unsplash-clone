<template>
  <div class="photo-grid">
    <div class="search-container">
      <div class="search-wrapper">
        <p v-if="loading" class="search-text">Searching for <span class="search-query">"{{ searchQuery }}"</span> </p>
        <p v-else class="search-text">Search Result for <span class="search-query">"{{ searchQuery }}"</span> </p>
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
  



<script>
  import { useRoute } from 'vue-router';
  import { ref, onMounted } from "vue";
import axios from "axios";
  export default {
    
    setup() {
      const route = useRoute();
  
      const searchQuery = route.query.q || ''; 
  
    const photos = ref([]);
    const loading = ref(true);
    const selectedPhoto = ref(null);
    const loadedImages = ref(new Set());
    const clientId = "30OARKOlxfkhgRieLRvgS5CdV3zg2bU2VotWXVQFfgo";
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
        const response = await axios.get(`https://api.unsplash.com/search/photos`, {
          params: {
            client_id: clientId,
            query: searchQuery || null,
            per_page: 10,
            order_by: "latest"
          },
        });

        photos.value = response.data.results.map((photo) => ({
          id: photo.id,
          author: photo.user.name,
          location: photo.user.location || "Unknown location",
          url: photo.urls.regular,
        }));

        console.log(
          "Fetched photos:",
          JSON.parse(JSON.stringify(photos.value))
        );
      } catch (error) {
        console.error("Error fetching photos:", error);
      } finally {
        loading.value = false;
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
      getStyleClass,
      selectedPhoto,
      openModal,
      closeModal,
      onImageLoad,
      searchQuery
    };
  },
  };
  </script>


<style lang="scss" scoped>
.photo-grid {
  min-width: 1400px;
  margin: 0 auto;
}

.search-container {
  background: #ecf3f6;
  height: 180px;
  width: 100%;
 

  .search-wrapper {
    padding-top: 60px;
    padding-left: 60px;

   .search-text {
      font-size: 40px;
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
    margin-top: -60px;
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
    height: 450px;
    background: whitesmoke;
    background-size: 200% 100%;
    animation: skeleton-loading 2.5s infinite;
    position: relative;
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

@media (max-width: 300px) {
    .grid-container {
  padding: 0px;

  .photo-layout {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 40px;
    margin: 0 auto;
  }
}
}

</style>

  