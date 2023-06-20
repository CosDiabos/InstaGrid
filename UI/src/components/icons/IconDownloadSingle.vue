<script>
export default {
  name: 'IconDownloadSingle',
  props: {w:{type:String,default:"6"}, h:{type:String,default:"6"}, title:{type:String,default:"Download selected posts (.zip)"}}
}
</script>
<template>
	<div :class="`w-${this.w} h-${this.h} inline-block`" :title="this.title">
		<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
	  <path stroke-linecap="round" stroke-linejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25"></path>
	</svg>
	</div>
</template>
