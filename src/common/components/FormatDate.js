import moment from 'moment';

const FormatDate = ({ value, format = 'YYYY-MM-DD' }) => {
    return moment(value).format(format);
  };
  
  export default FormatDate;