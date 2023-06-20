<script>
import axios from 'axios'
import FormData from 'form-data'
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'ProjectManager',
  inject: ["profile"],
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
      axios.get("http://localhost:3000/getProjects").then((res) => {
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
    console.log(err);
    })
    },
    saveProject(e) {
      console.log(this.selectedProject)
      axios.post("/saveProject", { name:this.selectedProject, profile:JSON.stringify(this.profile)} ).then((res) => {
        console.log(res.data)
        this.reloadProjects()
      }).catch((err) => {
        console.log(err);
      })
    },
    loadProject(e) {
      axios.get("http://localhost:3000/loadProject/" + this.selectedProject).then((res) => {
        console.log(res.data)
        this.profile = res.data;
        if (this.profile.uuid === undefined) {
          this.profile.uuid = uuidv4()
        }
      }).catch((err) => {
        console.log(err);
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
  <option value="test">test</option>
  <option v-for="project in this.projects" :value="project.name">{{project.name}}</option>
</select>
| Save current project: <b>{{ (this.selectedProject ? this.selectedProject : this.profileName) }}</b> <button :disabled="(!this.selectedProject && !this.profileName) ? true : false" @click="saveProject"
 class="inline-block btn-primary">Save</button>

  <!-- class="inline-block rounded bg-neutral-50 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-neutral-800 shadow-[0_4px_9px_-4px_#cbcbcb] transition duration-150 ease-in-out hover:bg-neutral-100  focus:bg-neutral-100 focus:outline-none focus:ring-0 active:bg-neutral-200" -->
</template>
