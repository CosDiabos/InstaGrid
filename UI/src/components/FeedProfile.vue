<script>
import axios from 'axios'
import FormData from 'form-data'
	// 
	// {
	// 	file: "",
	// 	source: 1,//local (0) or remote(1)

	// }
	// a
export default {
	name: 'feedprofile',
	inject: ["profile"],
	data () {
		return this.profile.posting
	},
  methods: {

  	mounted() {

  	}
  }
}

</script>

<template>

<div class="flex flex-wrap py-6">
      <ul class="leading-none px-0 mx-0">
        <li v-for="post in this.profile.posting" ref="post" class="w-1/3 inline-block px-[2px]">
        	<!-- <img v-if="post.source=0" v-bind:src="post.file "/> -->
          <img v-bind:src="post.caption !== undefined ? 'uploads/'+this.profile.uuid+'/'+post.file[0].file :  post.file[0].file"/>

        	<!-- <img v-if="post.source=1" v-bind:src="post.file"/> -->
        </li>
      </ul>
</div>
</template>