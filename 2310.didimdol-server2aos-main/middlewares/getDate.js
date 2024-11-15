//날짜, 시간 변환 코드
exports.today_date = async (date) => {
    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let day = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear().toString().substr(2);

    // current hours
    var hours = date_ob.getHours();
    hours = hours < 12 ? '0' + hours : hours;
    // current minutes
    var minutes = date_ob.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var result_date = year + month + day + hours + minutes;
    return result_date;
}
