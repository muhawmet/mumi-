function switchView(viewId) {
   document.querySelectorAll('.app-view').forEach(el => el.style.display = 'none');
   const target = document.getElementById('view-' + viewId);
   if(target) target.style.display = 'block';
   
   document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
   const activeBtn = document.querySelector('.nav-btn[onclick="switchView(\'' + viewId + '\')"]');
   if(activeBtn) activeBtn.classList.add('active');
}
window.switchView = switchView;
