<template>
    <div class="statistics">
      <div>
        <input type="checkbox" id="min" value="min" v-model="stats">
        <label for="min">Min</label>
      </div>
      <div>
      <input type="checkbox" id="max" value="max" v-model="stats">
      <label for="max">Max</label>
      </div>
      <div>
      <input type="checkbox" id="mean" value="mean" v-model="stats">
      <label for="mean">Average</label>
      </div>
      <div>
      <input type="checkbox" id="median" value="median" v-model="stats">
      <label for="median">Median</label>
      </div>
      <div>
      <input type="checkbox" id="std" value="std" v-model="stats">
      <label for="std">Standard Deviation</label>
      </div>
      <div>
      <input type="checkbox" id="var" value="var" v-model="stats">
      <label for="var">Variance</label>
      </div>
      
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
