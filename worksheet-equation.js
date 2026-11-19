// Keep both picture groups and the operator in a single row on screen and paper.
window.pictureAddition = (left, right) =>
  '<span class="picture-sum"><span class="sum-side">'+left+'</span>'+
  '<span class="sum-operator" aria-label="더하기">+</span>'+
  '<span class="sum-side">'+right+'</span></span>';
