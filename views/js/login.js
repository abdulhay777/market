jQuery(function($) {

    function validateEmail (email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    $('.login button').on('click', async function () {

        let email = $('.login input[type="email"]')
        let password = $('.login input[type="password"]')

        let bool = true

        if ($(email).val() == '') {
            $(email).addClass('error')
            bool = false
        } else {
            if (validateEmail($(email).val())) {
                $(email).removeClass('error')
                bool = true
            } else {
                $(email).addClass('error')
                bool = false 
            }
        }

        if ($(password).val() == '') {
            $(password).addClass('error')
            bool = false
        } else {
            $(password).removeClass('error')
            bool = true
        }

        if (bool) {
            try {
                const response = await fetch('/api/users/sign-in', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: $(email).val(),
                        password: $(password).val()
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                const json = await response.json()
                if (json.user) {
                    console.log(json.user)
                    localStorage.setItem('token', json.user._id)
                    window.location.href = '/'
                } else {
                    $('.res').text(json.message.Ru)
                }
            } catch (error) {
                console.error('Ошибка:', error)
            }
        }

    })

})