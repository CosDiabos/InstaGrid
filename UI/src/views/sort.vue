<script>
import Draggable from 'vuedraggable'

export default {
  name: 'sort',
  components: { Draggable },
  data() {
    return {
      todos:[
        {name:"a", more:[{surname:"a"}]},
        {name:"b", more:[{surname:"a"},{surname:"b"}]},
        {name:"c", more:[{surname:"a"},{surname:"b"}]},
        {name:"d", more:[{surname:"a"}]}
      ]
    }
  }
}
</script>

<template>
  <ul>
  <Draggable :list="this.todos" itemKey="id">
    <template #item="{ element, index }">
      <li>{{ element.more }}, {{ index }}</li>
    </template>
  </Draggable>
</ul>
  <!-- {{ this.todos }} -->
</template>
