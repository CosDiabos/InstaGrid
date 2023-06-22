<script>
import axios from 'axios'
import FormData from 'form-data'
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'ProjectManager',
  inject: ["profile", "msgBox"],
  props: ['profile-name'],
  components: {  },
  data() {
    return {
      projects: [],
      selectedProject: ""
    }
  },
  created() {
    // console.log("Prof Name: " + this.profileName);
    // var form = new FormData();
    // form.append('index', this.postIndex);
    this.reloadProjects()
  },
  methods: {
    reloadProjects() {
      this.projects = [];
      axios.get("/getProjects").then((res) => {
      // res.data.files
    for(var i=0;i<res.data.length;i++) {
      var name = res.data[i].split('.');
      if (name.length == 2) {
        this.projects.push({name:name[0]})
      } else {
        name.pop()
        this.projects.push({name:name.join("")})
      }
    }
    }).catch((err) => {
    this.msgBox.type = "error"
    this.msgBox.message = "There was a problem reloading your saved projects!\r\n" + err.message
    this.msgBox.show = true;
    })
    },
    saveProject(e) {
      axios.post("/saveProject", { name:(this.selectedProject ? this.selectedProject : this.profileName), profile:JSON.stringify(this.profile)} ).then((res) => {
        if (res.data == "OK") {
          this.msgBox.type = "success"
          this.msgBox.message = "Your project was saved successfully!"
          this.msgBox.show = true;
          this.reloadProjects()
        }
      }).catch((err) => {
        this.msgBox.type = "error"
        this.msgBox.message = "There was a problem saving your project." + err.message
        this.msgBox.show = true;
      })
    },
    loadProject(e) {
      this.msgBox.type = "info"
      this.msgBox.message = "Loading project..."
      this.msgBox.show = true;
      axios.get("/loadProject/" + this.selectedProject).then((res) => {
        this.profile = res.data;
        if (this.profile.uuid === undefined) {
          this.profile.uuid = uuidv4()
        }
      }).catch((err) => {
        this.msgBox.type = "error"
        this.msgBox.message = "There was a problem saving your project." + err.message
        this.msgBox.show = true;
      })
    },
  },
  watch: {
    profileName(newV,oldV) {
      if (newV != "") {
        this.selectedProject = ""
      }
    }
  }
}
</script>

<template>
Load a project: 
<select name="projectName" id="projectName" v-model="this.selectedProject" @change="loadProject($event)" class="bg-transparent border-2 border-solid border-b-gray-300 hover:border-b-gray-300 focus:border-b-gray-400 min-w-[150px] focus-visible:outline-none">
  <option value="">----</option>
  <option v-for="project in this.projects" :value="project.name">{{project.name}}</option>
</select>
| Save current project: <b>{{ (this.selectedProject ? this.selectedProject : this.profileName) }}</b> <button :disabled="this.selectedProject == '' && this.profileName == '' ? true : false" @click="saveProject"
 class="inline-block btn-primary">Save</button>

  <!-- class="inline-block rounded bg-neutral-50 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-neutral-800 shadow-[0_4px_9px_-4px_#cbcbcb] transition duration-150 ease-in-out hover:bg-neutral-100  focus:bg-neutral-100 focus:outline-none focus:ring-0 active:bg-neutral-200" -->
</template>
