<script>
export default {
	name: 'HeaderHighlights',
	inject: ["profile"],
	data () {

	},
  methods: {

  	mounted() {

  	}
  }
}

</script>

<template>

<div class="flex py-6 max-w-full" :class="(this.profile.highlights.length > 0 ? '' : 'hidden')">
      <ul class="leading-none px-0 mx-0 overflow-x-hidden overflow-y-hidden whitespace-nowrap">
        <li v-for="highlight in this.profile.highlights" ref="post" class="w-1/12 inline-block mx-8">
          <img v-bind:src="highlight.file" class="rounded-full w-30 h-30 border-gray-100 border-2 p-0.5"/>
          <p class="text-xs font-bold text-center mt-1">{{highlight.caption}}</p>
        </li>
      </ul>
</div>
</template>