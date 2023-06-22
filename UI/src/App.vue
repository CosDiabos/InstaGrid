<script>
import HeaderProfile from './components/HeaderProfile.vue'
import FeedProfile from './components/FeedProfile.vue'
import FeedSchedule from './components/FeedSchedule.vue'
import { ref, provide } from 'vue'
import { v4 as uuidv4 } from 'uuid';

var profile = {
  uuid:uuidv4(),
  username: "",
  posts: "0",
  followers:"0",
  following: "0",
  PP: "",
  name:"",
  bio:"",
  highlights: [],
  posting:[
    
  ],
  schedule:[
    
    ]
};

var msgBox = {
  show:false,
  type:"error",
  message:""
}
const prof = ref(profile)
const statusBar = ref(msgBox)
// provide('profile', prof);

  export default {
  name: 'app',
  components: {
    HeaderProfile,
    FeedProfile,
    FeedSchedule
  },
  provide: {
    profile: prof,
    msgBox: statusBar
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
