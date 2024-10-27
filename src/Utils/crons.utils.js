import { scheduleJob } from "node-schedule"
import { Coupon } from "../../DB/Models/index.js";
import { DateTime } from "luxon";



export const disableCouponsCron = () =>{
  scheduleJob('0 59 23 * * *', async () => {
    console.log('cron job to disable coupons disableCouponsCron()');
    const enableCoupons = await Coupon.find({isEnable: true});
    
    if (enableCoupons.length) {
      for(const coupon of enableCoupons) {
        if (Date.now() > DateTime.fromJSDate(coupon.till)){
          coupon.isEnable = false;
          await coupon.save();
        }
      }
    }
  })
}