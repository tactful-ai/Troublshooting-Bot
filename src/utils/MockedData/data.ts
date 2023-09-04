class User {
    static isAuthenticated(userName: string, password: string) {
        const user = this.users.find(user => user.username == userName && user.password == password);
        return user ? true : false;
    }
    static getUserIban(nationalId: string, phone: string) {
        const user = this.users.find(user => user.nationalId == nationalId && user.phone == phone);
        return user?.iban ?? "Not Found";
    }
    static users = [
        {
            username: "ahmed",
            password: "123",
            phone: "01129411111",
            nationalId: "201990101001001",
            iban: "01129411111A201990101001001"
        },
        {
            username: "mohamed",
            password: "1234",
            phone: "01129411112",
            nationalId: "201990101001002",
            iban: "01129411112B201990101001002"
        },
        {
            username: "mostafa",
            password: "12345",
            phone: "01129411113",
            nationalId: "201990101001003",
            iban: "01129411113C201990101001003"
        },
    ];

    static products = [
        {
            id: "0",
            title: "mobile",
            subTitle: "electonics item",
            mediaURL: "https://res.cloudinary.com/tactful/image/upload/v1638776139/users/1002288/1638042690798_asmgij.jpg",
        },
        {
            id: "1",
            title: "labtop",
            subTitle: "electonics item",
            mediaURL: "https://res.cloudinary.com/tactful/image/upload/v1638776139/users/1002288/1638042690798_asmgij.jpg",
        }
    ]
}
export default User;