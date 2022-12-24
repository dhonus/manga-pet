console.log('Client-side code running');

const links = document.getElementsByClassName('manga-link-a');
for (let i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function(e) {
        console.log('button was clicked');
        let loading = document.getElementById('loading');
        loading.classList.remove('hidden');
    });
}

function go(){
    console.log("go");
}