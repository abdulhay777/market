jQuery( function ($) {

    const token = 'Bearer ' + document.cookie.replace('token=', '')

    const socket = io("/", {
        extraHeaders: { Authorization: token }
    })

    function validateEmail (email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    socket.on('IN_Message', function (data) {
        alert(data)
    })

    socket.on('OUT_MarketAdd', function (data) {
        $('.not').attr('style', 'display: none')
        $('.main__market ul').append(`<li data-id="${data._id}"><a href='/market/${data._id}'>${data.market_name}</a></li>`)
    })

    socket.on('OUT_MarketDelete', function (data) {
        $(`.main__market li[data-id='${data}']`).remove()
        window.location.href = '/'
    })

    socket.on('OUT_ProductAdd', function (data) {
        $(`.main__content__lists`).append(`
            <div class="main__content__list" data-id="${data._id}">
                <div>
                    <p>${data.product_name}</p>
                    <span class="list-count">Count: ${data.product_count}</span>
                    |
                    <span class="list-price">Price: ${data.product_price}$</span>
                </div>
                <div>
                    <button class="blue history" data-fancybox data-src="#history">History</button>
                    <button class="green edit" data-fancybox data-src="#edit">Edit</button>
                    <button class="green buy" data-fancybox data-src="#buy">Buy</button>
                    <button class="red remove">Remove</button>
                </div>
            </div>
        `)
    })

    socket.on('OUT_ProductEdit', function (data) {
        $(`.main__content__list[data-id='${data._id}']`).html('')
        $(`.main__content__list[data-id='${data._id}']`).html(`
            <div>
                <p>${data.product_name}</p>
                <span class="list-count">Count: ${data.product_count}</span>
                |
                <span class="list-price">Price: ${data.product_price}$</span>
            </div>
            <div>
                <button class="blue history" data-fancybox data-src="#history">History</button>
                <button class="green edit" data-fancybox data-src="#edit">Edit</button>
                <button class="green buy" data-fancybox data-src="#buy">Buy</button>
                <button class="red remove">Remove</button>
            </div>
        `)
    })

    socket.on('OUT_ProductRemove', function (data) {
        $(`.main__content__list[data-id='${data}']`).remove()
    })

    socket.on('OUT_History', function (data) {
        data.forEach((e) => {
            let date = new Date(Number(e.date))
            let d = date.getDay()+'.'+date.getMonth()+'.'+date.getFullYear() + ' ' + date.getHours()+':'+date.getMinutes()
            $('#history table').append(`
                <tr>
                    <td>${e.name}</td>
                    <td>${e.count}</td>
                    <td>${e.price}$</td>
                    <td>${e.total_price}$</td>
                    <td>${d}</td>
                </tr>
            `)
        })
    })

    $('#add-market button').on('click', function () {
        let val = $('#add-market input').val()
        if (val == '') {
            $('#add-market input').addClass('error')
            return
        }

        $('#add-market input').removeClass('error')

        socket.emit('IN_MarketAdd', val)

        setTimeout(() => {
            new Fancybox.close();
            $('#add-market input').val('')
        }, 500);
    })

    $(`#add-list button`).on('click', function () {

        let name = $(`#add-list .name`).val()
        let count = $(`#add-list .count`).val()
        let price = $(`#add-list .price`).val()

        let bool = true

        if (name == '') {
            $(`#add-list .name`).addClass('error')
            bool = false
        } else {
            $(`#add-list .name`).removeClass('error')
            bool = true
        }

        if (count == '') {
            $(`#add-list .count`).addClass('error')
            bool = false
        } else {
            $(`#add-list .count`).removeClass('error')
            bool = true
        }

        if (price == '') {
            $(`#add-list .price`).addClass('error')
            bool = false
        } else {
            $(`#add-list .price`).removeClass('error')
            bool = true
        }

        if (bool) {

            let data = {
                name: name,
                price: price,
                count: count,
                market_id: window.location.href.split('/')[4]
            }

            socket.emit('IN_ProductAdd', data)

            setTimeout(() => {
                new Fancybox.close();
                $(`#add-list .name`).val('')
                $(`#add-list .count`).val('')
                $(`#add-list .price`).val('')
            }, 500);

        }

    })

    $('#add-user button').on('click', function () {
        let email = $('#add-user input')

        let bool = false

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

        if (bool) {
            socket.emit('IN_AddUser', {
                email: $(email).val(),
                market_id: window.location.href.split('/')[4]
            })
            setTimeout(() => {
                new Fancybox.close();
                $(email).val('')
            }, 500);
        }

    })

    $('.delete').on('click', function () {
        socket.emit('IN_MarketDelete', window.location.href.split('/')[4])
    })

    $('#buy button').on('click', function () {
        const count = $('#buy input')
        if ($(count).val() == '') {
            $(count).addClass('error')
            return
        } else {
            let count_text = $(`.main__content__list[data-id='${localStorage.getItem('product_id')}']`).find('.list-count').text()
            let num = count_text.replace('Count: ', '')
            if (Number(num) < Number($(count).val())) {
                alert('ss')
                $(count).addClass('error')
                return
            }
        }

        $(count).removeClass('error')

        socket.emit('IN_Buy', {
            product_id: localStorage.getItem('product_id'),
            user_id: localStorage.getItem('token'),
            count: $(count).val()
        })

        setTimeout(() => {
            new Fancybox.close();
            $(count).val('')
        }, 500);

    })

    $('#edit button').on('click', function () {

        let name = $(`#edit .name`).val()
        let count = $(`#edit .count`).val()
        let price = $(`#edit .price`).val()

        let bool = true

        if (name == '') {
            $(`#edit .name`).addClass('error')
            bool = false
        } else {
            $(`#edit .name`).removeClass('error')
            bool = true
        }

        if (count == '') {
            $(`#edit .count`).addClass('error')
            bool = false
        } else {
            $(`#edit .count`).removeClass('error')
            bool = true
        }

        if (price == '') {
            $(`#edit .price`).addClass('error')
            bool = false
        } else {
            $(`#edit .price`).removeClass('error')
            bool = true
        }

        if (bool) {
            socket.emit('IN_ProductEdit', {
                product_id: localStorage.getItem('product_id'),
                name: name,
                price: price,
                count: count
            })
            setTimeout(() => {
                new Fancybox.close();
                $(`#edit .name`).val('')
                $(`#edit .count`).val('')
                $(`#edit .price`).val('')
            }, 500);
        }

    })

    $(document).on('click', `.edit`, function () {
        localStorage.setItem('product_id', $(this).parents('.main__content__list').attr('data-id'))
        let count = $(`.main__content__lists [data-id='${localStorage.getItem('product_id')}']`).find('.list-count').text()
        let price_text = $(`.main__content__lists [data-id='${localStorage.getItem('product_id')}']`).find('.list-price').text()
        price_text = price_text.replace('Price: ', '')
        price_text = price_text.replace('$', '')
        count = count.replace('Count: ', '')
        $(`#edit .name`).val($(`.main__content__lists [data-id='${localStorage.getItem('product_id')}']`).find('p').text())
        $(`#edit .count`).val(count)
        $(`#edit .price`).val(price_text)
    })

    $(document).on('click', `.buy`, function () {
        localStorage.setItem('product_id', $(this).parents('.main__content__list').attr('data-id'))
    })

    $(document).on('click', `.remove`, function (e) {
        socket.emit('IN_ProductRemove', $(this).parents('.main__content__list').attr('data-id'))
    })

    $(document).on('click', `.history`, function () {
        $('#history table').html('')
        $('#history table').html(`
            <tr>
                <th>User name</th>
                <th>Count</th>
                <th>Price</th>
                <th>Total price</th>
                <th>Date</th>
            </tr>
        `)
        localStorage.setItem('product_id', $(this).parents('.main__content__list').attr('data-id'))
        socket.emit('IN_History', localStorage.getItem('product_id'))
    })

    // $('.logout').on('click', function (e) {
    //     e.preventDefault();
    //     document.cookie = 'token= ;'
    //     window.location.href = '/'
    // })

})