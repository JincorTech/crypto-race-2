import * as React from 'react';
import s from './styles.css';

import Button from '../../common/Button';
import Avatar from '../../common/Avatar';
import HealthIndicator from '../HealthIndicator';

const User = () => (
  <div className={s.container}>
    <div className={s.info}>
      <div className={s.avatar}>
        <Avatar />
      </div>
      <div className={s.name}>
        <span>STARLORD /</span>
        <div className={s.indicator}>
          <HealthIndicator />
        </div>
        <div className={s.level}>
          <span>15</span>
        </div>
      </div>
      <div className={s.balance}>
        <span><span className={s.balanceCaption}>RACES: </span>10 <span className={s.totalWins}>/ 30 (40)</span> | <span className={s.balanceCaption}>BALANCE: </span><span className={s.balanceEth}>100 ETH</span> 000,1 BTC</span>
      </div>
      <div className={s.buttons}>
        <div className={s.addButton}>
          <Button text="+ADD" color="#3593eb"/>
        </div>
        <Button text="WITHDRAW" color="#ed1c24"/>
      </div>
    </div>
    <div className={s.buttons}>
    </div>
  </div>
);

export default User;
