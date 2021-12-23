<template>
  <!--  <iframe src="http://43.255.28.187:8986/doc.html" width="100%" height="853" style="border:none;" />-->
  <iframe :src="baseUrl" width="100%" height="853" style="border:none;" />
</template>

<script>
export default {
  name: 'Swagger',
  data() {
    return {
      baseUrl: process.env.VUE_APP_DOC_URL
    }
  },
  created() {
    console.log(this.baseUrl)
  }
}
</script>
