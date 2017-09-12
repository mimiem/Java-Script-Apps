$(() => {
    const app = Sammy('#main', function () {
        this.use('Handlebars', 'hbr');

        this.get('index.html',displayWelcome);

        //this.get('',displayWelcome);

        function displayWelcome() {
            console.log('Displaying welcome screen');
            this.loadPartials({
                header: './templates/common/header.hbr',
                footer: './templates/common/footer.hbr'
            }).then(function () {
                this.partial('./templates/welcome.hbr');
            })
        }

        this.get('#/register',function () {
            this.loadPartials({
                header: './templates/common/header.hbr',
                footer: './templates/common/footer.hbr'
            }).then(function () {
                this.partial('./templates/register.hbr');
            })
        });

        this.get('#/contacts',function () {
            this.loadPartials({
                header: './templates/common/header.hbr',
                footer: './templates/common/footer.hbr',
                contact: './templates/common/contact.hbr',
                contact_list: './templates/common/contactsList.hbr',
                contact_details: './templates/common/details.hbr'
            }).then(function () {
                this.partial('./templates/contacts.hbr');
            })
        });

        this.get('#/profile',function () {
            this.loadPartials({
                header: './templates/common/header.hbr',
                footer: './templates/common/footer.hbr'
            }).then(function () {
                this.partial('./templates/profile.hbr');
            })
        });

        this.get('#/logout',function () {
            auth.logout()
                .then(()=>{
                    localStorage.clear();
                    this.redirect('index.html');
                })
        });

        this.post('#/login',function (context) {
            let username = context.params.username;
            let password = context.params.password;
            console.log('Login in');
            console.log(username);
            console.log(password);
            auth.login(username, password)
                .then(function (data) {
                    auth.saveSession(data);
                    context.redirect('#/contacts');
                });
        });

        this.post('#/register',function () {
            //Handle register
        });

        this.post('#/profile',function () {
            //Handle profile
        });
    }).run()
});