<script>
import axios from 'axios'
import FormData from 'form-data'
import FeedEditPost from './FeedEditPost.vue'
import IconAddImg from './icons/IconAddImg.vue'
import IconEditPost from './icons/IconEditPost.vue'
// import IconAddMoreImg from './icons/IconAddMoreImg.vue'
import IconPassToPosted from './icons/IconPassToPosted.vue'
import IconReorder from './icons/IconReorder.vue'
import IconRemove from './icons/IconRemove.vue'
import IconDownloadAll from './icons/IconDownloadAll.vue'
import IconDownloadSingle from './icons/IconDownloadSingle.vue'

import { ref } from 'vue';
import Draggable from 'vuedraggable'
import { Carousel, Input, initTE } from "tw-elements";
// import { Carousel, Input, initTE } from "tw-elements";
	// 
	// {
	// 	file: "",
	// 	source: 1,//local (0) or remote(1)

	// }
	// a
const editObj = ref({
      dialog:false, // show or not , true or false
      index: -1
    });


export default {
  name: 'feedschedule',
	inject: ["profile", "msgBox"],
  emits:['updateEdit'],
  setup(props, context) {

    return { editObj:editObj }
  },
  components: { FeedEditPost, Draggable, IconAddImg, IconEditPost, IconPassToPosted, IconReorder, IconRemove, IconDownloadAll, IconDownloadSingle },

	data () {
		return { editIndex:-1, edittingPost:false, cacheKey:0, postIndex:"", refreshEditPost:false, customExport:false }
	},
  mounted() {
  // initTE({ Carousel, Input }, true);
    const myCarouselEl = document.getElementById("carouselExampleControls");
    if (myCarouselEl != null) {
      const myCarousel = new Carousel(myCarouselEl);
      myCarousel.cycle();
    }
  },
  methods: {
    uploadImages(event) {
      var form = new FormData();
      if (event.target.files.length == 0) {
        this.postIndex = ""
        return;
      }
      if (event.target.files.length > 6) {
        this.postIndex = ""
        return;
      }
      form.append('index', this.postIndex);
      form.append('uuid', this.profile.uuid);
      for (var i = event.target.files.length - 1; i >= 0; i--) {
        form.append('img', event.target.files[i])
      }

      axios.post("/upload", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then((res) => {
        for (var i = 0; i < res.data.files.length; i++) {
          if (res.data.index == "") {
            // Assign [] to .schedule if doesn´t exist
            this.profile.schedule ??=[];
            // New post
            this.profile.schedule.unshift(
            {
              file:[res.data.files[i]],
              caption: "",
              location: "",
              date:""
            });
          } else {
            // Adds an image to already existing post
            this.profile.schedule[res.data.index].file.push(res.data.files[i]);
            // FeedEditPost.reload();
            this.refreshEditPost = true;
          }
        }

      }).catch((err) => {
        this.msgBox.type = "error"
        this.msgBox.message = "There was a problem uploading your images. " + err.message
        this.msgBox.show = true;
      })
    },
    openEdit(index) {
      if (isNaN(index)) {
        return;
      } else {
        // this.handleUpdate(index);
        this.editObj.index = index;
        this.editObj.dialog = !this.editObj.dialog;
        // this.$emit('openEditIndex', index);
      }

    },
    delSchedule(index) {
      if (isNaN(index)) {
        return;
      } else {
        let delEdit = {
            file:this.profile.schedule[index].file[0].file,
          }
        axios.post("/delImage", delEdit).then((res) => {
          if (res.data == "OK") {
            this.profile.schedule.splice(index, 1);
            this.msgBox.type = "success"
            this.msgBox.message = "Post deleted!"
            this.msgBox.show = true;
          }
        }).catch(err => {
          //Error in ajax POST
          this.msgBox.type = "error"
          this.msgBox.message = "There was a problem deleting your post. " + err.message
          this.msgBox.show = true;

        })
      }
    },
    commitEditPost(e, data) {
      editObj.value.dialog = e;
      if (Object.keys(data).length > 0) {
        this.profile.schedule[editObj.value.index] = data
      }
      const nowTime = +new Date()
      this.cacheKey = nowTime
    },
    triggerPostUpload(index) {
      this.postIndex = index
      // Resetting refreshEditPost var/prop,so it is changed upon img upload
      // and watch: from FeedEditPost.vue triggers.
      this.refreshEditPost = false;

      //input type=file DOM .click() at FeedEditPost.vue::uploadImagePost(e) method
    },
    itemKey(k) {
      // console.log(k)
    },
    passToPosted(index) {
      this.profile.posting.unshift(this.profile.schedule[index]);
      this.profile.schedule.splice(index,1);
    },
    imgSrc(el) {
      if (this.profile.uuid != "") {
      return "uploads/" + this.profile.uuid + "/" + el + "?cache=" + this.cacheKey
      } else {
      return "uploads/" + el + "?cache=" + this.cacheKey
      }
    },
    customExportFunc(all = false) {
      let indexesToExport = document.querySelectorAll("input[name='index']:checked");
      if (indexesToExport.length > 0) {
        let objExport = [];
        for (var i = 0; i < indexesToExport.length; i++) {
          objExport[i] = this.profile.schedule[indexesToExport.length-i-1];
          indexesToExport[i].checked = false
        }
        this.msgBox.type = "info"
        this.msgBox.message = "Exporting posts..."
        this.msgBox.show = true;
        axios.post("/export", {files:objExport, uuid:this.profile.uuid}).then((res) => {
          window.open(
            res.data.zip, "_blank");
        }).catch((err) => {
        this.msgBox.type = "error"
        this.msgBox.message = "There was an error exporting your posts. " + err.message
        this.msgBox.show = true;
        })
      }
      this.customExport = !this.customExport
    },
    allExportFunc() {
      let indexesToExport = document.querySelectorAll("input[name='index']");
      if (indexesToExport.length > 0) {
        let objExport = [];
        for (var i = 0; i < indexesToExport.length; i++) {
          objExport[i] = this.profile.schedule[indexesToExport.length-i-1];
          indexesToExport[i].checked = false
        }
        this.msgBox.type = "info"
        this.msgBox.message = "Exporting posts..."
        this.msgBox.show = true;
        axios.post("/export", {files:objExport, uuid:this.profile.uuid}).then((res) => {
          window.open(
            res.data.zip, "_blank");
        }).catch((err) => {
        this.msgBox.type = "error"
        this.msgBox.message = "There was an error exporting your posts. " + err.message
        this.msgBox.show = true;
        })
      } 
    },
  }
}

</script>

<template>
<div v-if="this.editObj.dialog == true" class="overlay">
  <FeedEditPost v-bind:show="this.editObj.dialog" v-bind:index="this.editObj.index" @updateEdit="commitEditPost" :cache-key="this.cacheKey" @triggerUpload="triggerPostUpload" :refresh-img-edit-post="this.refreshEditPost" />
</div>
<div class="feed schedule flex flex-wrap py-6 border-b border-gray-500">
    <div class="helper w-full py-2 px-2 bg-gray-200">
      <p class="text-md">Tools:</p>
      <form name="imgsFeed" enctype="multipart/form-data">
        <input type="hidden" name="i" :value="this.postIndex"/>
        <label for="img"><IconAddImg class="cursor-pointer" />
          <input type="file" name="img" id="img" multiple accept="image/png, image/jpeg" @change="uploadImages" class="hidden"></label>
          <!-- <input type="submit" value="enviar"> -->
        <IconDownloadAll class="cursor-pointer" @click="allExportFunc" /><IconDownloadSingle class="cursor-pointer" @click="customExportFunc" />
        </form>
        <div class="result hidden"></div>
    </div>
    <p class="zero_grid text-xs text-center w-full my-2">Upload images with <IconAddImg w="4" h="4" /> (max. 6 images, max. filesize 1M per file, JPG or PNG)</p> 
    <div v-if="this.profile.schedule && this.profile.schedule.length < 1" class="flex flex-wrap text-center border-dashed border-gray-400 border-[1px] rounded w-full p-28 bg-gray-100">
      <p class="text-center text-gray-400 mx-auto">This is your scheduled posts section. Your future posts will appear here.</p>
    </div>

      <ul class="leading-none">
        <Draggable v-model="this.profile.schedule" item-key="file" handle=".handle">
          <template #item="{ element, index }">
            <li class="handle w-1/3 group inline-block px-[2px]" :key="element.id">
              <input type="checkbox" name="index" :value="index" :class="this.customExport ? '' : 'hidden'">
              <img class="w-full" v-if="element.file.length < 2" v-bind:src="imgSrc(element.file[0].file)"/>
              <!-- container -->
              <!-- <div v-else v-for="(file, index) in element.file" class="relative"></div> -->

                <div v-else
  id="carouselExampleControls"
  class="relative"
  data-te-carousel-init
  data-te-carousel-slide>
  <!--Carousel items-->
  <div
    class="relative w-full overflow-hidden after:clear-both after:block after:content-['']">
    <!--First item-->
    <div  v-for="(file, index) in element.file"
      class="relative float-left -mr-[100%] w-full transition-transform duration-[600ms] ease-in-out motion-reduce:transition-none"
      data-te-carousel-item
      data-te-carousel-active>
      <img
        v-bind:src="imgSrc(file.file)"
        class="block w-full"
        alt="Wild Landscape" />
    </div>
  </div>

  <!--Carousel controls - prev item-->
  <button
    class="absolute bottom-0 left-0 top-0 z-[1] flex w-[15%] items-center justify-center border-0 bg-none p-0 text-center text-white opacity-50 transition-opacity duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] hover:text-white hover:no-underline hover:opacity-90 hover:outline-none focus:text-white focus:no-underline focus:opacity-90 focus:outline-none motion-reduce:transition-none"
    type="button"
    data-te-target="#carouselExampleControls"
    data-te-slide="prev">
    <span class="inline-block h-8 w-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="h-6 w-6">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </span>
    <span
      class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
      >Previous</span
    >
  </button>
  <!--Carousel controls - next item-->
  <button
    class="absolute bottom-0 right-0 top-0 z-[1] flex w-[15%] items-center justify-center border-0 bg-none p-0 text-center text-white opacity-50 transition-opacity duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] hover:text-white hover:no-underline hover:opacity-90 hover:outline-none focus:text-white focus:no-underline focus:opacity-90 focus:outline-none motion-reduce:transition-none"
    type="button"
    data-te-target="#carouselExampleControls"
    data-te-slide="next">
    <span class="inline-block h-8 w-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="h-6 w-6">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </span>
    <span
      class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
      >Next</span
    >
  </button>
</div>



              <div class="schedule_action text-gray-400 text-center">
                <button @click="openEdit(index)"><IconEditPost/></button>
                <button @click="delSchedule(index)"><IconRemove /></button>
                <button @click="downloadSingle(index)"><IconDownloadSingle title="Download this post" /></button>
                <button @click="passToPosted(index)"><IconPassToPosted /></button>
                <p class="group-hover:inline hidden text-xs text-gray-400"><IconReorder w="4" h="4" /> Drag me to re-order</p>
              </div>
          </li>
      </template>
        <!-- 
        <li v-for="(post, index) in element" ref="schedule">
          {{ post }}
          <img v-bind:src="`${post.file[0].file}?cache=${this.cacheKey}`"/>
          <div class="schedule_action">
            <button @click="openEdit(index)">Edit</button>
            <button @click="delSchedule(index)">Delete</button>
          </div>
        </li> --> 
      </Draggable>
      </ul>
</div>
</template>