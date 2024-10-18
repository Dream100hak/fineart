// src/components/NavigationBar.js
import { Link } from 'react-router-dom';

function NavigationBar() {
  return (
    <nav id="gnbWrapper">
      <ul id="gnb">
        <li><Link to="/free_board">자유게시판</Link></li>
        <li><Link to="/gallery">갤러리</Link></li>
        <li><Link to="/signupSuccess">공모전</Link></li>
        <li><Link to="/ranking">개인전</Link></li>
        <li><Link to="/ranking">아트페어</Link></li>
        <li><Link to="/artistIntroduction">국내작가소개</Link></li>
        <li><Link to="/artistIntroduction">해외작가소개</Link></li>
      </ul>
    </nav>
  );
}

export default NavigationBar;
