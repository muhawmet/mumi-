document.addEventListener("DOMContentLoaded", () => {
    const selects = document.querySelectorAll("select.studio-select");
    
    // Create Modal Container
    const modal = document.createElement('div');
    modal.className = 'custom-select-modal';
    modal.innerHTML = `
        <div class="custom-select-overlay"></div>
        <div class="custom-select-content">
            <h2 class="custom-select-title">Select Option</h2>
            <div class="custom-select-grid grid g3"></div>
            <button class="custom-select-close btn ghost">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);

    const overlay = modal.querySelector('.custom-select-overlay');
    const closeBtn = modal.querySelector('.custom-select-close');
    const grid = modal.querySelector('.custom-select-grid');
    const titleEl = modal.querySelector('.custom-select-title');

    function closeModal() {
        modal.classList.remove('active');
    }

    overlay.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);

    selects.forEach(select => {
        select.style.display = 'none';

        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper';
        
        const trigger = document.createElement('button');
        trigger.className = 'custom-select-trigger btn ghost';
        trigger.type = 'button';
        
        const updateTrigger = () => {
            const selectedOpt = select.options[select.selectedIndex];
            trigger.innerHTML = `<span>${selectedOpt ? selectedOpt.text : 'Select...'}</span> <small>▼</small>`;
        };
        updateTrigger();

        select.addEventListener('change', updateTrigger);

        trigger.addEventListener('click', () => {
            titleEl.textContent = select.previousElementSibling ? select.previousElementSibling.textContent : 'Select Option';
            grid.innerHTML = '';

            Array.from(select.options).forEach((opt, index) => {
                const card = document.createElement('button');
                card.className = `card ${select.selectedIndex === index ? 'sel' : ''}`;
                // Add reference specific gradient classes if needed
                let extraClass = '';
                if(select.id === 'cascade-reference') {
                   // A small preview stripe
                   card.innerHTML = `<div class="refCardPreview ${opt.value}"></div><h3>${opt.text}</h3><p>${opt.value}</p>`;
                } else if(select.id === 'cascade-world') {
                   card.innerHTML = `<h3>${opt.text}</h3><p class="pill gold">${opt.value}</p>`;
                } else {
                   card.innerHTML = `<h3>${opt.text}</h3>`;
                }

                card.onclick = () => {
                    select.selectedIndex = index;
                    select.dispatchEvent(new Event('change'));
                    closeModal();
                };
                grid.appendChild(card);
            });

            modal.classList.add('active');
        });

        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(trigger);
        wrapper.appendChild(select);
    });
});
