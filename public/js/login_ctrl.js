function Login(e) {
    e.preventDefault();
    const username = $('.username').val();
    const password = $('.password').val();
    if (username === '') {
        $('.username').focus();
        $('.username').css('border-color', 'red');
        $('.error').html('Username is required');
    } else if (password === '') {
        $('.password').focus();
        $('.password').css('border-color', 'red');
        $('.error').html('Password is required');
    } else {
        $('.error').html('');
        $('.fa-refresh').show();
        $('.btn').attr('disabled', true);
        $.ajax({
            url: "/login",
            contentType: "application/json",
            dataType: "json",
            type: "POST",
            data: JSON.stringify({
                username: username,
                password: password
            }),
            success: function (response) {
                if (response.msg) {
                    $('.password').focus();
                    $('.password').css('border-color', 'red');
                    $('.error').html(response.msg);
                    $('.fa-refresh').hide();
                    $('.btn').attr('disabled', false);
                } else {
                    localStorage.setItem('data', JSON.stringify(response.response));
                    window.location = 'blog';
                }
            }
        });
    }
}