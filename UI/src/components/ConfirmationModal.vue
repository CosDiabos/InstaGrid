<script>
export default {
  name: 'ConfirmationModal',
  props: {title:{type:String,default:"Confirm action"},message:{type:String,default:"Confirm message"},ConfirmType:{type:String,default:"Action"},show:{type:String,default:"true"}},
  setup(props, context) {
    const modalResult = (data) => {
      context.emit('modalResult', data);
    };
    return {
      modalResult
    };
  },
  data() {
    return {showFlag:this.show}
  },
  methods: {
    replyModal(action) {
      this.modalResult(action.target.getAttribute("action"))
      this.showFlag = "false"
    }
  },
  watch: {
    show: function(newV, oldV) {
      this.showFlag = newV;
    }
  }
}
</script>
<template>
  <div class="antialiased fixed top-0 left-0 right-0 z-50 p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full" :class="(this.showFlag == 'false' ? 'hidden' : '')">
  <div class="relative px-4 min-h-screen md:flex md:items-center md:justify-center">
    <div class="bg-black opacity-25 w-full h-full absolute z-10 inset-0"></div>
    <div class="bg-white rounded-lg md:max-w-md md:mx-auto p-4 fixed inset-x-0 bottom-0 z-50 mb-4 mx-4 md:relative">
      <div class="md:flex items-center">
        <div class="rounded-full border border-gray-300 flex items-center justify-center w-16 h-16 flex-shrink-0 mx-auto">
          <div class="w-12 h-12">
            <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"></path>
          </svg>
          </div>
        </div>
        <div class="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
          <p class="font-bold">{{this.title}}</p>
          <p class="text-sm text-gray-700 mt-1">{{this.message}}
          </p>
        </div>
      </div>
      <div class="text-center md:text-right mt-4 md:flex md:justify-end">
        <button class="block w-full md:inline-block md:w-auto px-4 py-3 md:py-2 bg-red-200 text-red-700 rounded-lg font-semibold text-sm md:ml-2 md:order-2" action="true" @click="replyModal">Delete
            {{this.ConfirmType}}</button>
        <button class="block w-full md:inline-block md:w-auto px-4 py-3 md:py-2 bg-gray-200 rounded-lg font-semibold text-sm mt-4
          md:mt-0 md:order-1" action="false" @click="replyModal">Cancel</button>
      </div>
    </div>
  </div>
</div>

</template>