<script>
import HeaderProfile from './components/HeaderProfile.vue'
import FeedProfile from './components/FeedProfile.vue'
import FeedSchedule from './components/FeedSchedule.vue'
import { ref, provide } from 'vue'
import { v4 as uuidv4 } from 'uuid';

var profile = {
  uuid:"test",
  username: "",
  posts: "0",
  followers:"0",
  following: "0",
  PP: "",
  name:"Jess",
  bio:"Club de música electrónica para melómanxs con equipo de sonido L-Acoustics.",
  highlights: [],
  posting:[
    {
      file:[
        {
          file:"uploads/test.png"
        }
      ]
    },
    {
      file:[
        {
          file:"uploads/test.png"
        }
      ]
    },
    {
      file:[
        {
          file:"uploads/p1.jpg"
        }
      ]
    },
    {
      file:[
        {
          file:"uploads/p2.jpg"
        }
      ]
    },
    {
      file:[
        {
          file:"uploads/p3.jpg"
        }
      ]
    }
  ],
  schedule:[
    {
      file:[
        {
          file:"img-1683623677319.png"
        }
      ],
      caption:"Caption2",
      location:"Location",
      date: "2023-05-09T00:00"
    },
    {
      file: [
        {
          file:"img-1683796776126.04.33.png"
        },
        {
          file:"img-1683796776126.04.34.jpg"
        }
    ],
      caption:"",
      location:"",
      date: ""
    },
    {
      file: [
        {
          file:"img-1684229632482.35.37.png"
        }
    ],
      caption:"a",
      location:"",
      date: ""
    }
    ]
};

const prof = ref(profile)
// provide('profile', prof);

  export default {
  name: 'app',
  components: {
    HeaderProfile,
    FeedProfile,
    FeedSchedule
  },
  provide: {
    profile: prof
  },
  methods: {
      
    },
    created() {
    }
}

/* Initialize TW Elements */
// initTE({ Carousel }, true );

</script>
<template>
  <div class="msgbox hidden">
    <p class="msg">Leave screenshot mode by pressing Esc</p>
  </div>
  
  

  <HeaderProfile />

  <FeedSchedule />
  
  <FeedProfile />


</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
