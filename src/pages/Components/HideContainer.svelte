<script lang="ts">
  export let hide = false
  export let message = ''
</script>

{#if hide}
  <hideContainer>
    {message}
  </hideContainer>
{/if}

<style>
  hideContainer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #ccccccb3;
    display: flex;
    place-content: center;
    place-items: center;
    flex-direction: column;
    text-align: center;
    text-shadow: 4px 4px 16px #000;
    font-size: 2em;
    font-family: 'RobotoBold';
    color: #4c0708;
    border-radius: 8px;
  }
</style>
