<script>
import axios from 'axios'
import IconAddMoreImg from './icons/IconAddMoreImg.vue'

var cropDOM, original_width,original_height,original_mouse_x,original_mouse_y, original_x,original_y;
var minimum_size = 20
var tst = false
export default {
  inject: ["profile"],
  name: 'feededitpost',
  props:['index','show','cache-key', 'refresh-img-edit-post'],
  components: {IconAddMoreImg},
  data() {
    return {
      edittingImageStatus: false,
      edittingPost: this.show,
      editIndex:this.index,
      cropping:false,
      cropper:tst,
      shouldResize:false,
      editObj:[],
      previewClasses: [],
      previewImage:"",
      previewImageBase64:"",
      rotationPreview:0,
      flipvPreview:false,
      fliphPreview:false
    }
  },
  setup(props, context) {
    const hideDialog = (data) => {
      context.emit('updateEdit', !props.show, data);
    };

    const updateCacheKey = () => {
      context.emit('updateEdit', props.show, {});
    };

    const setPostIndex = (index) => {
      context.emit('triggerUpload', index);
    };

    return {
      hideDialog, updateCacheKey, setPostIndex
    };
  },
  methods: {
    editImage(e) {
      switch(e.currentTarget.getAttribute('action')) {
      case 'edit_start':
        this.edittingImageStatus = true
        this.previewClasses.push("preview")
      break;

      case 'crop':
        if (this.cropping == false) {
          cropDOM.style.display = "block"
        } else {
          cropDOM.style.display = ""
        }
        this.cropping = !this.cropping
        console.log(this.cropping)

        const resizers = document.querySelectorAll('.crop' + ' .cropper');
        let original_width = 0;
        let original_height = 0;
        let original_x = 0;
        let original_y = 0;
        let original_mouse_x = 0;
        let original_mouse_y = 0;
        for (let i = 0;i < resizers.length; i++) {
          var currentResizer = resizers[i];
          currentResizer.addEventListener('mousedown', function(e) {
            e.preventDefault()
            tst = true;
            original_width = parseFloat(getComputedStyle(cropDOM, null).getPropertyValue('width').replace('px', ''));
            original_height = parseFloat(getComputedStyle(cropDOM, null).getPropertyValue('height').replace('px', ''));
            original_x = cropDOM.getBoundingClientRect().left;
            original_y = cropDOM.getBoundingClientRect().top;
            original_mouse_x = e.pageX;
            original_mouse_y = e.pageY;
            // cropDOM.removeEventListener('mousemove', this.resize)
            // cropDOM.addEventListener('mouseup', this.stopResize)
            console.log("mouseDown!");
            console.log(tst);
          });
          }
      break;

      case 'rotate+90':
        if (this.rotationPreview + 90 == 360) {
          this.rotationPreview = 0;
        } else {
          this.rotationPreview += 90;
        }
        this.previewImageSrc()
      break;

      case 'rotate-90':
        if (this.rotationPreview - 90 == -360) {
          this.rotationPreview = 0;
        } else {
          this.rotationPreview -= 90;
        }
        this.previewImageSrc()
      break;

      case 'flip_v':
        if (this.flipvPreview) {
          this.flipvPreview = false;
          this.previewClasses.splice(this.previewClasses.lastIndexOf("flip_v"), 1);
          break;
        }
        if (this.fliphPreview == true) {
            this.previewClasses.push("flip_v_h")
          this.previewClasses.splice(this.previewClasses.lastIndexOf("flip_h"), 1);
        } else {
            this.previewClasses.push("flip_v")
            this.flipvPreview = true;            
        }
      break;

      case 'flip_h':
        if (this.fliphPreview) {
          this.fliphPreview = false;
          this.previewClasses.splice(this.previewClasses.lastIndexOf("flip_h"), 1);
          break;
        }
        if (this.flipvPreview == true) {
            this.previewClasses.push("flip_v_h")
          this.previewClasses.splice(this.previewClasses.lastIndexOf("flip_v"), 1);
        } else {
            this.previewClasses.push("flip_h")
            this.fliphPreview = true;
        }
      break;

      case 'edit_end':
        this.edittingImageStatus = false
        if (this.cropping == true) {
          cropDOM.style.display = ""
        }
        let imgEdit = {
            file:this.previewImage,
            rotation: this.rotationPreview, // > 0 = rotation needed
            flip:false,
            flop:false
          }
        // not need to be sent to back-end
        this.previewClasses.splice(this.previewClasses.lastIndexOf("preview"), 1);
        for (var i = 0; i < this.previewClasses.length; i++) {
        switch(this.previewClasses[i]) {
        case 'flip_v':
          imgEdit.flip = true;
          break;


        case 'flip_h':
          imgEdit.flop = true;
          break;

          
        case 'flip_v_h':
          imgEdit.flip = true;
          imgEdit.flop = true;
          break;
        }
      // this.previewClasses.length
        }
        console.log(imgEdit);
        axios.post("/editImage", imgEdit).then((res) => {
          if (res.data == "OK")
          {
            // Cache-key needs to be updated in the parent in order to 
            // force refresh of the content. This updateCacheKey() func emits
            // an event to the parent component, in order to update it.
            this.updateCacheKey();
            this.rotationPreview = 0;
          }
        })
      break;

      default:
      return;  
      }
      console.log(e.currentTarget.getAttribute('action'));
    },
    
    editPost() {
      this.hideDialog(this.editObj)
    },

    editCancel() {
      // this.edittingPost = false
      // this.show = false
      this.hideDialog({});
    },
    
    openEdit(e) {
      console.log("open edit1")
      console.log(e)
    },
    
    mouseDown(e) {
      console.log("down");
      console.log(e.screenX);
      this.shouldResize = true
    },
    
    mouseUp (e) {
      console.log("Up");
      console.log(e.screenX);
      this.shouldResize = false
    },
    
    mouseMove (e) {
      if (this.shouldResize) {
        console.log("Move");
        console.log(e);
      }
    },
    resize(e) {
      if (tst) {
      console.log("original_width = %f, original_height = %f, original_x = %f, original_y = %f, original_mouse_x = %f, original_mouse_y = %f", original_width, original_height, original_x, original_y, original_mouse_x, original_mouse_y);
      // console.log(original_width, original_height, original_x, original_y, original_mouse_x, original_mouse_y);
      original_width = parseFloat(getComputedStyle(cropDOM, null).getPropertyValue('width').replace('px', ''));
      original_height = parseFloat(getComputedStyle(cropDOM, null).getPropertyValue('height').replace('px', ''));
      original_x = cropDOM.getBoundingClientRect().left;
      original_y = cropDOM.getBoundingClientRect().top;
      original_mouse_x = e.pageX;
      original_mouse_y = e.pageY;

      if (e.target.classList.contains('up')) {
        const width = original_width + (e.pageX - original_mouse_x)
        const height = original_height - (e.pageY - original_mouse_y)
        console.log(width)
        console.log(height)
        if (width > minimum_size) {
          cropDOM.style.width = width + 'px'
        }
        if (height > minimum_size) {
          cropDOM.style.height = height + 'px'
        }
      }

      if (e.target.classList.contains('right')) {
        const width = original_width + (e.pageX - original_mouse_x);
        const height = original_height + (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          cropDOM.style.width = width + 'px'
        }
        if (height > minimum_size) {
          cropDOM.style.height = height + 'px'
        }
      }
      if (e.target.classList.contains('bot')) {
        const width = original_width + (e.pageX - original_mouse_x);
        const height = original_height + (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          cropDOM.style.width = width + 'px'
        }
        if (height > minimum_size) {
          cropDOM.style.height = height + 'px'
        }
      }
      if (e.target.classList.contains('left')) {
        const width = original_width + (e.pageX - original_mouse_x);
        const height = original_height + (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          cropDOM.style.width = width + 'px'
        }
        if (height > minimum_size) {
          cropDOM.style.height = height + 'px'
        }
      }

      }
    },
      stopResize() {
      if (tst) {
        console.log("mouseUp")
        // cropDOM.removeEventListener('mousemove', this.resize)
        tst = false;
      }
      // this.cropper = false;
    },
    changeImage(e) {
      this.previewImage = "uploads/" + this.profile.uuid + "/" + this.editObj.file[e].file
    },
    uploadImagePost(e) {
      this.setPostIndex(this.editIndex)
      var imgFormDOM = document.getElementById("img");
      imgFormDOM.click();
    },

    previewImageSrc() {
      // ${previewImage}?cache=${this.cacheKey}
      console.log(this.rotationPreview);

      var src = this.previewImage + "?cache=" + this.cacheKey;
      if (this.rotationPreview != 0) {

        const getImg = new Promise((resolve, reject) => {
          axios.post("/prevImage/" + this.rotationPreview, {file:this.previewImage})
          .then((resp) => {
            return resolve(resp.data); 
          })
          .catch((er) => {
            return reject(er)
          });
        });
        (async function(a){
        var re = await getImg;
        a.previewImageBase64 = re;
        console.log(re)
        })(this)

        } else {
          this.previewImageBase64 = "";
      }
    }
  },
  mounted() {
    cropDOM = document.querySelector(".crop");
    cropDOM.addEventListener('mousemove', this.resize)
    cropDOM.addEventListener('mouseup', this.stopResize)
    // console.log(this.previewImageSrc())
  },
  created() {
    // console.log(this.profile.schedule);
    this.editObj = JSON.parse(JSON.stringify(this.profile.schedule[this.editIndex]))
    // console.log(this.editObj);
    this.previewImage = "uploads/" + this.profile.uuid + "/" + this.editObj.file[0].file;
  },
  update() {
    // console.log("This exists!!");
  },
  computed: {
//     PreviewImage() {
//       // ${previewImage}?cache=${this.cacheKey}
//       console.log(this.rotationPreview);
//       if (this.rotationPreview != 0) {
//         axios.post("http://localhost:3000/prevImage/" + this.rotationPreview, {file:this.previewImage}).then((res) => {
//           console.log(res.data);
//           return "mani"
//             // return res.data;
//         }).catch((e) => { console.log("errer!" + e); return this.previewImage + "?cache=" + this.cacheKey; });
//         } else {
//         return this.previewImage + "?cache=" + this.cacheKey;
//       }
//     // if (this.rotationPreview == 90 || this.rotationPreview == -270) {
//     //   return 'rotate90'
//     // } else if (this.rotationPreview == -90  || this.rotationPreview == 270) {
//     //   return 'rotate270'
//     // } else if (this.rotationPreview == 180 || this.rotationPreview == -180) {
//     //   return 'rotate180'
//     // } else {
//     //   return this.previewImage + "?cache=" + this.cacheKey;
//     // }
// }
},
watch: {
  refreshImgEditPost:function (newV,oldV) {
    console.log('a')
    console.log('New: %s Old: %s', newV,oldV)
    if (newV == true) {
        console.log("Must refresh after file upload!")
        this.editObj.file = JSON.parse(JSON.stringify(this.profile.schedule[this.editIndex].file));
        console.log("Updated!")
    } else {
      console.log("false!")
    }
  }
}
}
</script>

<template>
<!-- <div v-if="this.editIndex != -1" class="overlay"> -->
<div class="dialog edit">
     <div class="img"> <!-- Post Image Container -->
    <p class="w-full text-xs text-center">By adding more images this post will turn into a gallery (max. 6 images per upload, 1M, JPG or PNG)</p>
       <div class="w-full thumbsPost border-2 border-solid border-gray-200 rounded">
         <ul>
           <li class="text-xs inline-block min-h-full" @click="uploadImagePost"><IconAddMoreImg w="12" h="12" /></li>
           <li class="inline-block min-h-full" v-for="(image, index) in this.editObj.file"><img :src="`uploads/${this.profile.uuid}/${image.file}?cache=${this.cacheKey}`" @click="changeImage(index)" class="w-20"></li>
         </ul>
       </div>
       <div class="w-full">
         <ul>
           <li class="btn" v-if="this.edittingImageStatus === false" action="edit_start" @click="editImage">Edit Image</li>
           <li v-if="this.edittingImageStatus == true" action="crop" @click="editImage">Crop</li>
           <li v-if="this.edittingImageStatus == true" action="rotate-90" @click="editImage">Rotate -90º</li>
           <li v-if="this.edittingImageStatus == true" action="rotate+90" @click="editImage">Rotate 90º</li>
           <li v-if="this.edittingImageStatus == true" action="flip_v" @click="editImage">Flip V</li>
           <li v-if="this.edittingImageStatus == true" action="flip_h" @click="editImage">Flip H</li>
           <li class="btn" v-if="this.edittingImageStatus === true" action="edit_end" @click="editImage">Finish Editing</li>
         </ul>
       </div>
       <div class="img_container">
         <div class="crop">
           <span class="cropper up"></span>
           <span class="cropper right"></span>
           <span class="cropper bot"></span>
           <span class="cropper left"></span>
         </div>
         <!-- Visually rotating the img DOM breaks CSS as it gets ignored by the browser. Workaround to have back-end send a rotated version of the image, 
          which is returned as a base64 string. If previewImageBase64 is 'true', then it was returned by the back-end and takes precedence
          over the this.previewImage from edit obj (which is a deep copy from the profile[n] array pos) -->
         <img id="imgEditObj" :src="previewImageBase64 ? previewImageBase64 : (this.previewImage + '?cache=' + this.cacheKey)" :class="this.previewClasses">
       </div>
     </div>
     <div class="data"> <!-- Post Info Container -->
      <h2 class="text-3xl font-bold mb-6">Editing post</h2>
       <div class="data_row">
         <div class="caption font-bold text-sm">Caption:</div>
         <div class="input">
          <div class="relative mb-3" data-te-input-wrapper-init>
            <textarea
              class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
              name="caption"
              rows="3"
              placeholder="Caption" v-model="this.editObj.caption"></textarea>
          </div>
          <!-- <textarea name="caption" placeholder="Caption" v-model="this.editObj.caption"></textarea> -->
        </div>
       </div>
       <div class="data_row">
         <div class="caption font-bold text-sm">Location:</div>
         <div class="input"><input type="text" name="location" placeholder="Location" v-model="this.editObj.location"></div>
       </div>
       <div class="data_row">
         <div class="caption font-bold text-sm">Date & Time to post:</div>
         <div class="input"><input type="datetime-local" name="date" placeholder="Date" v-model="this.editObj.date"></div>
       </div>
       <div class="data_row">
         <div class="caption font-bold text-sm">Notes:</div>
         <div class="input">
          <div class="relative mb-3" data-te-input-wrapper-init>
            <textarea
              class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
              name="notes"
              rows="1"
              placeholder="Notes" v-model="this.editObj.notes"></textarea>
          </div>
         </div>
       </div>
       <div class="data_row">
         <div class="button">
          <button @click="editCancel" class="inline-block btn-primary mr-5">Cancel</button>
          <button @click="editPost" class="inline-block btn-primary">Submit</button>
        </div>
       </div>
     </div>
</div>
<!-- </div> -->
</template>

<style>
  .overlay {
    width: inherit;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background-color: white;
    overflow: none;
    padding: 6% 0px;
    z-index: 1;
}

  .dialog.edit {
    position: absolute;
    width: 70%;
    left: 15%;
    z-index: 1;
background-color: rgb(41 41 41 / 7%);
    border-radius: 10px;
    padding: 13px 5px;
    color: black;
}

.img, .data {
    width: 48%;
    float: left;
    margin-left: 2%;
}

.img {
  display: table;
}

.img_container {
    width: 100%;
    margin-bottom: 1%;
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
}

.img_container > img {
  width: 100%;
    height: auto;
    width: 100%;
    /* height: 200px; */
    object-fit: cover;
    object-position: center;
}

/* Img manipulation (crop, flip, etc.) preview, based on applied classes 
pass the transform image instructions  upon saving */

.img_container > img.preview {
  background-color: red;
}

.img_container > img.preview.flip_h {
  transform:scaleX(-1);
  -webkit-transform: scaleX(-1);
}

.img .rotate270 {
  transform: rotate(-90deg) translate(-100%) scale(0.65);
  transform-origin: top left;
  margin-top:-30%;
  margin-left: 20%;
}

.img .rotate90 {
    transform: rotate(90deg) translate(0, -100%) scale(0.70);
    transform-origin: top left;
    margin-left: -40%;
}

.img .rotate180 {
    transform: rotate(180deg);
}

.img_container > img.preview.flip_v {
  transform:scaleY(-1);
  -webkit-transform: scaleY(-1);
}

.img_container > img.preview.flip_v_h {
  transform:scale(-1,-1);
  -webkit-transform: scale(-1,-1);
}

.crop {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgb(229 11 11 / 50%);
    z-index: 2;
    left: 0;
    top: 0;
    display: none;
}

.crop > span {
    display: block;
    background-color: black;
    position: absolute;
}

.crop span.up {
    width: 40px;
    height: 10px;
    top: 0;
    left: calc(50% - 20px);
}

.crop span.right {
    height: 40px;
    width: 10px;
    right: 0;
    top: calc(50% - 20px);
}


.crop span.bot {
    width: 40px;
    height: 10px;
    bottom: 0;
    left: calc(50% - 20px);
}

.crop span.left {
    height: 40px;
    width: 10px;
    left: 0;
    top: calc(50% - 20px);
}

/*.options.thumbsPost {
    border: solid 1px black;
    border-radius: 10px;
    margin-bottom: 20px;
}*/

/*.thumbsPost li.btn {
    font-size: 0.9em;
    margin: 0px;
}

.thumbsPost li {
    width: 100px;
    border: none !important;
    border-right: solid 1px black !important;
    cursor: pointer;
}*/

.data .data_row {
    margin-bottom: 4%;
    float: left;
    width: 100%;
}

.data_row .caption {
    width: 30%;
    float: left;
}

.data_row .input {
    width: 70%;
    float: left;
}

.input input, .input textarea {
    width: 80%;
    height: 35px;
    border: none;
    border-bottom: solid 2px black;
    font-size: 12pt;
    height: 40px;
    background-color: inherit;
}

.input textarea {
  height: 130px;
}
/*
input:focus-visible, textarea:focus-visible {
    outline: none;
}*/
/*
.data_row button {
    width: 45%;
    margin-right: 5%;
    float: left;
    height: 35px;
    border: solid 1px black;
    background-color: black;
    color: white;
    font-weight: bold;
}
*/
.dialog .options .btn {
    border: solid 1px;
    font-weight: bold;
}

/*.dialog h2 {
    margin-bottom: 15px;
}*/

.options {
    width: 100%;
    float: left;
}

.options ul {
    margin: 0;
    padding: 0;
}


.options li {
    display: inline-block;
    margin: 0px 20px 10px 0px;
    background-color: #efefef;
    padding: 5px 10px;
    border-radius: 2px;
    border: solid 1px #555353;
}

/*.thumbsPost li {
    width: 100px;
    border: none !important;
    float: left;
    background-color: transparent;
    margin:0;
    line-height: 1;
}
*/


</style>