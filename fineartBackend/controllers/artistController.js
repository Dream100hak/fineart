// controllers/artistController.js
const { promisePool } = require('../db/dbConnection');
const { v4: uuidv4 } = require('uuid');

// 작품 코드 생성 함수 정의
function generateArtworkCode(artistId) {
  const shortCode = uuidv4().split('-')[0];
  return `ART-${artistId}-${shortCode}`;
}

// 작가 목록 조회
async function getArtists(req, res) {
  try {
    const sql = `
      SELECT a.*,
        COUNT(aw.id) AS artwork_count,
        MIN(aw.id) AS first_artwork_id
      FROM artists a
      LEFT JOIN artworks aw ON a.id = aw.artist_id
      GROUP BY a.id
    `;
    const [artists] = await promisePool.query(sql);

    // 각 작가의 첫 번째 작품 이미지 가져오기
    for (let artist of artists) {
      if (artist.first_artwork_id) {
        const [artworks] = await promisePool.query(
          'SELECT image_url FROM artworks WHERE id = ?',
          [artist.first_artwork_id]
        );
        artist.representative_image = artworks[0]?.image_url || null;
      } else {
        artist.representative_image = null;
      }
    }

    const total = artists.length;
    res.status(200).json({ total, artists });
  } catch (err) {
    console.error('작가 목록 조회 실패:', err);
    res.status(500).json({ error: '작가 목록 조회 중 오류가 발생했습니다.' });
  }
}

// 특정 작가 정보 조회
async function getArtistById(req, res) {
  const { id } = req.params;

  try {
    const sqlArtist = 'SELECT * FROM artists WHERE id = ?';
    const [artistRows] = await promisePool.query(sqlArtist, [id]);

    if (artistRows.length > 0) {
      const artist = artistRows[0];

      // 해당 작가의 작품 목록 가져오기
      const sqlArtworks = 'SELECT * FROM artworks WHERE artist_id = ?';
      const [artworks] = await promisePool.query(sqlArtworks, [id]);

      // 작가 정보에 작품 목록 추가
      artist.artworks = artworks;

      res.status(200).json(artist);
    } else {
      res.status(404).json({ message: '작가를 찾을 수 없습니다.' });
    }
  } catch (err) {
    console.error('작가 정보 조회 실패:', err);
    res.status(500).json({ error: '작가 정보를 가져오는 중 오류가 발생했습니다.' });
  }
}

// 작가 추가
async function addArtist(req, res) {
  const { name, description, birth, score, star, wins, status, nationality } = req.body;

  try {
    const sql = `
      INSERT INTO artists (name, description, birth, score, star, wins, status, nationality)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await promisePool.query(sql, [name, description, birth, score, star, wins, status, nationality]);
    res.status(201).json({ message: '작가 추가 성공', artistId: result.insertId });
  } catch (err) {
    console.error('작가 추가 실패:', err);
    res.status(500).json({ error: '작가 추가 중 오류가 발생했습니다.' });
  }
}

// 작가 삭제
async function deleteArtist(req, res) {
  const { id } = req.params;

  try {
    // 작가 삭제
    const [result] = await promisePool.query('DELETE FROM artists WHERE id = ?', [id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: '작가가 삭제되었습니다.' });
    } else {
      res.status(404).json({ message: '작가를 찾을 수 없습니다.' });
    }
  } catch (err) {
    console.error('작가 삭제 실패:', err);
    res.status(500).json({ error: '작가 삭제 중 오류가 발생했습니다.' });
  }
}

// 작가 수정
async function updateArtist(req, res) {
  const { id } = req.params;
  const {
    name,
    description,
    birth,
    score,
    star,
    wins,
    status,
    nationality,
    artworks: artworksFromBody
  } = req.body;

  console.log('받은 데이터:', req.body);

  const connection = await promisePool.getConnection();

  try {
    await connection.beginTransaction();

    // 작가 정보 업데이트
    const sqlUpdateArtist = `
      UPDATE artists
      SET name = ?, description = ?, birth = ?, score = ?, star = ?, wins = ?, status = ?, nationality = ?
      WHERE id = ?
    `;
    const [result] = await connection.query(sqlUpdateArtist, [
      name,
      description,
      birth,
      score,
      star,
      wins,
      status,
      nationality,
      id
    ]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: '작가를 찾을 수 없습니다.' });
    }

    // 작품 업데이트
    // 기존 작품 ID 목록 가져오기
    const [existingArtworks] = await connection.query('SELECT id FROM artworks WHERE artist_id = ?', [id]);
    const existingArtworkIds = existingArtworks.map((artwork) => artwork.id);

    // 프론트엔드에서 받은 작품 ID 목록
    const sentArtworkIds = artworksFromBody.filter((artwork) => artwork.id).map((artwork) => artwork.id);

    // 삭제할 작품 ID 목록
    const artworksToDelete = existingArtworkIds.filter((artworkId) => !sentArtworkIds.includes(artworkId));

    // 작품 삭제
    if (artworksToDelete.length > 0) {
      await connection.query('DELETE FROM artworks WHERE id IN (?)', [artworksToDelete]);
    }

    // 작품 추가 및 수정
    for (const artwork of artworksFromBody) {
      // 프론트엔드에서 받은 데이터를 그대로 사용
      const artworkData = {
        name: artwork.name !== undefined ? artwork.name : null,
        price: artwork.price !== undefined ? artwork.price : null,
        is_rentable: artwork.is_rentable !== undefined ? artwork.is_rentable : null,
        image_url: artwork.image_url !== undefined ? artwork.image_url : null,
        category: artwork.category !== undefined ? artwork.category : null,
        description: artwork.description !== undefined ? artwork.description : null,
        canvas_type: artwork.canvas_type !== undefined ? artwork.canvas_type : null,
        canvas_size: artwork.canvas_size !== undefined ? artwork.canvas_size : null,
      };

      if (artwork.id) {
        // 기존 작품 업데이트
        const sqlUpdateArtwork = `
      UPDATE artworks
      SET 
        name = COALESCE(?, name),
        price = COALESCE(?, price),
        is_rentable = COALESCE(?, is_rentable),
        image_url = COALESCE(?, image_url),
        category = COALESCE(?, category),
        description = COALESCE(?, description),
        canvas_type = COALESCE(?, canvas_type),
        canvas_size = COALESCE(?, canvas_size)
      WHERE id = ? AND artist_id = ?
    `;
        await connection.query(sqlUpdateArtwork, [
          artwork.name,
          artwork.price,
          artwork.is_rentable,
          artwork.image_url,
          artwork.category,
          artwork.description,
          artwork.canvas_type,
          artwork.canvas_size,
          artwork.id,
          id,
        ]);
      } else {
        // 새로운 작품 추가
        const code = generateArtworkCode(id);
        const sqlInsertArtwork = `
          INSERT INTO artworks (artist_id, code, name, price, is_rentable, image_url, category, description, canvas_type, canvas_size)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.query(sqlInsertArtwork, [
          id,
          code,
          artworkData.name,
          artworkData.price,
          artworkData.is_rentable,
          artworkData.image_url,
          artworkData.category,
          artworkData.description,
          artworkData.canvas_type,
          artworkData.canvas_size
        ]);
      }
    }

    // 트랜잭션 커밋
    await connection.commit();

    // 업데이트된 작가 정보 가져오기
    const sqlArtist = 'SELECT * FROM artists WHERE id = ?';
    const [artistRows] = await promisePool.query(sqlArtist, [id]);
    const artist = artistRows[0];

    // 해당 작가의 작품 목록 가져오기
    const sqlArtworks = 'SELECT * FROM artworks WHERE artist_id = ?';
    const [artworkRows] = await promisePool.query(sqlArtworks, [id]);

    // 작가 정보에 작품 목록 추가
    artist.artworks = artworkRows || [];

    res.status(200).json(artist);
  } catch (err) {
    await connection.rollback();
    console.error('작가 수정 실패:', err);
    res.status(500).json({ error: '작가 수정 중 오류가 발생했습니다.' });
  } finally {
    connection.release();
  }
}



module.exports = { getArtists, getArtistById, addArtist, deleteArtist, updateArtist };
