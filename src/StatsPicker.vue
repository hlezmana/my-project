<template>
    <div class="statistics">
      <input type="checkbox" id="min" value="min" v-model="stats"/>
      <label for="min">Min</label>
      <input type="checkbox" id="max" value="max" v-model="stats"/>
      <label for="max">Max</label>
      <input type="checkbox" id="mean" value="mean" v-model="stats"/>
      <label for="mean">Average</label>
      <input type="checkbox" id="median" value="median" v-model="stats"/>
      <label for="median">Median</label>
      <input type="checkbox" id="std" value="std" v-model="stats"/>
      <label for="std">Standard Deviation</label>
      <input type="checkbox" id="var" value="var" v-model="stats"/>
      <label for="var">Variance</label>
      
      <button v-on:click="addStatistics(stats)"><i title="Add statistics" class="fa fa-calculator"></i></button>
    </div>
</template>

<script>
export default {
  name: 'StatsPicker',
  props: {
    stats: Array
  }
}
</script>
