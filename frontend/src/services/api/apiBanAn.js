import { trinhKhachApi, tachPhanHoiApi, coSuDungMayChu } from '../trinhKhachApi'
import { chuanHoaTrangThaiBan } from '../../constants/trangThaiBan'
import { chuanHoaMaKhuVucBan, chuanHoaTenKhuVucBan } from '../../constants/khuVucBan'
import {
  taoPhanHoiOffline,
  layDanhSachBanOffline,
  capNhatTrangThaiBanOffline,
  laySoBanMoiOffline,
  capNhatHeThongOffline,
  taoThongTinQrBanOffline,
  layThucDonTheoBanOffline,
  timDonHangOfflineTheoMa,
  timBanOfflineTheoMa,
  taoChiTietDonHangTaiBanOffline,
  taoMaDonHangMoiOffline,
} from '../offline/dichVuOfflineStore'

const suyRaKhuVucTuViTri = (viTri = '') => chuanHoaMaKhuVucBan(viTri)

const chuanHoaBanAn = (ban) => {
  if (!ban || typeof ban !== 'object') {
    return null
  }

  return {
    ...ban,
    code: ban.maBan || ban.MaBan,
    name: ban.tenBan || ban.TenBan || `Bàn ${ban.soBan ?? ban.SoBan ?? ''}`.trim(),
    tableNumber: Number(ban.soBan ?? ban.SoBan ?? 0),
    capacity: Number(ban.soChoNgoi ?? ban.SoChoNgoi ?? 0),
    areaId: suyRaKhuVucTuViTri(ban.khuVuc || ban.KhuVuc || ban.viTri || ban.ViTri || ''),
    rawAreaText: chuanHoaTenKhuVucBan(ban.khuVuc || ban.KhuVuc || ban.viTri || ban.ViTri || ''),
    note: ban.ghiChu || ban.GhiChu || '',
    status: chuanHoaTrangThaiBan(ban.trangThai || ban.TrangThai || ''),
  }
}

export const layDanhSachBanApi = async () => {
  if (!coSuDungMayChu()) {
    const duLieu = layDanhSachBanOffline().map((ban) => ({
      maBan: ban.code,
      MaBan: ban.code,
      tenBan: ban.name,
      TenBan: ban.name,
      soBan: Number(ban.tableNumber || 0),
      SoBan: Number(ban.tableNumber || 0),
      soChoNgoi: Number(ban.capacity || 0),
      SoChoNgoi: Number(ban.capacity || 0),
      khuVuc: chuanHoaTenKhuVucBan(ban.rawAreaText || ban.areaId || ''),
      KhuVuc: chuanHoaTenKhuVucBan(ban.rawAreaText || ban.areaId || ''),
      viTri: chuanHoaTenKhuVucBan(ban.rawAreaText || ban.areaId || ''),
      ViTri: chuanHoaTenKhuVucBan(ban.rawAreaText || ban.areaId || ''),
      ghiChu: ban.note || '',
      GhiChu: ban.note || '',
      trangThai: ban.status,
      TrangThai: ban.status,
    }))

    return {
      ...tachPhanHoiApi(taoPhanHoiOffline(duLieu, 'Lay danh sach ban thanh cong')),
      duLieu: duLieu.map(chuanHoaBanAn).filter(Boolean),
    }
  }

  const phanHoi = tachPhanHoiApi(await trinhKhachApi.get('/ban'))
  return {
    ...phanHoi,
    duLieu: Array.isArray(phanHoi.duLieu) ? phanHoi.duLieu.map(chuanHoaBanAn).filter(Boolean) : [],
  }
}

const mapTrangThaiBanApi = (status) => {
  if (status === 'TRONG') return 'TRONG'
  if (status === 'CO_KHACH') return 'CO_KHACH'
  if (status === 'CHO_THANH_TOAN') return 'CHO_THANH_TOAN'
  return status
}

export const capNhatTrangThaiBanApi = async (id, status) => {
  if (!coSuDungMayChu()) {
    capNhatTrangThaiBanOffline(id, mapTrangThaiBanApi(status))
    return tachPhanHoiApi(taoPhanHoiOffline(null, 'Cap nhat trang thai ban thanh cong'))
  }

  return tachPhanHoiApi(await trinhKhachApi.patch(`/ban/${id}/status`, { trangThai: mapTrangThaiBanApi(status) }))
}

export const taoBanApi = async (payload) => {
  if (!coSuDungMayChu()) {
    const maBan = String(payload.maBan || `B${String(laySoBanMoiOffline()).padStart(3, '0')}`).trim()
    const soBan = Number(payload.soBan || laySoBanMoiOffline())

    capNhatHeThongOffline((draft) => {
      draft.ban.push({
        id: maBan,
        code: maBan,
        name: payload.tenBan || `Bàn ${soBan}`,
        tableNumber: soBan,
        capacity: Number(payload.soChoNgoi || 0),
        areaId: suyRaKhuVucTuViTri(payload.khuVuc || payload.viTri || ''),
        rawAreaText: chuanHoaTenKhuVucBan(payload.khuVuc || payload.viTri || ''),
        note: payload.ghiChu || '',
        status: 'TRONG',
      })
    })

    return tachPhanHoiApi(taoPhanHoiOffline({ maBan }, 'Tao ban thanh cong'))
  }

  return tachPhanHoiApi(await trinhKhachApi.post('/ban', payload))
}

export const capNhatBanApi = async (maBan, payload) => {
  if (!coSuDungMayChu()) {
    capNhatHeThongOffline((draft) => {
      const ban = draft.ban.find((item) => String(item.code || item.id) === String(maBan || ''))
      if (!ban) {
        throw new Error('Không tìm thấy bàn.')
      }

      ban.name = payload.tenBan || ban.name
      ban.tableNumber = Number(payload.soBan || ban.tableNumber || 0)
      ban.capacity = Number(payload.soChoNgoi || ban.capacity || 0)
      ban.rawAreaText = chuanHoaTenKhuVucBan(payload.khuVuc || payload.viTri || ban.rawAreaText || '')
      ban.areaId = suyRaKhuVucTuViTri(ban.rawAreaText)
      ban.note = payload.ghiChu || ''
    })

    return tachPhanHoiApi(taoPhanHoiOffline({ maBan }, 'Cap nhat ban thanh cong'))
  }

  return tachPhanHoiApi(await trinhKhachApi.put(`/ban/${maBan}`, payload))
}

export const xoaBanApi = async (maBan) => {
  if (!coSuDungMayChu()) {
    capNhatHeThongOffline((draft) => {
      draft.ban = draft.ban.filter((item) => String(item.code || item.id) !== String(maBan || ''))
    })

    return tachPhanHoiApi(taoPhanHoiOffline(null, 'Xoa ban thanh cong'))
  }

  return tachPhanHoiApi(await trinhKhachApi.delete(`/ban/${maBan}`))
}

export const layQrBanApi = async (maBan) => {
  if (!coSuDungMayChu()) {
    return tachPhanHoiApi(taoPhanHoiOffline(taoThongTinQrBanOffline(maBan), 'Lay QR ban thanh cong'))
  }

  return tachPhanHoiApi(await trinhKhachApi.get(`/ban/${maBan}/qr`))
}

// ========== QR table ordering ==========

const timOrderDangMoTheoBan = (maBan) => {
  const ban = timBanOfflineTheoMa(maBan)
  if (!ban) {
    throw new Error('Bàn không tồn tại hoặc QR code không hợp lệ')
  }

  const candidate = timDonHangOfflineTheoMa(ban.activeOrderCode || '')
  if (candidate && !['DA_THANH_TOAN', 'HOAN_THANH', 'DA_HUY'].includes(candidate.trangThai)) {
    return candidate
  }

  return null
}

export const layTenMonTrongChiTietOrder = (mon) => String(
  mon?.tenMon
    || mon?.TenMon
    || mon?.tenMonAn
    || mon?.TenMonAn
    || mon?.monAn?.tenMon
    || mon?.monAn?.TenMon
    || '',
).trim()

const chuanHoaChiTietOrderDangMoTaiBan = (mon) => {
  if (!mon || typeof mon !== 'object') return mon
  const tenMon = layTenMonTrongChiTietOrder(mon)
  return {
    ...mon,
    maMon: mon.maMon ?? mon.MaMon,
    MaMon: mon.MaMon ?? mon.maMon,
    tenMon,
    TenMon: tenMon,
    soLuong: Number(mon.soLuong ?? mon.SoLuong ?? 0),
    SoLuong: Number(mon.SoLuong ?? mon.soLuong ?? 0),
    donGia: Number(mon.donGia ?? mon.DonGia ?? 0),
    DonGia: Number(mon.DonGia ?? mon.donGia ?? 0),
    thanhTien: Number(mon.thanhTien ?? mon.ThanhTien ?? 0),
    ThanhTien: Number(mon.ThanhTien ?? mon.thanhTien ?? 0),
  }
}

export const chuanHoaOrderDangMoTaiBan = (duLieu) => {
  if (!duLieu || typeof duLieu !== 'object') return duLieu

  const donHang = duLieu.donHang || duLieu.DonHang || null
  const danhSachChiTiet = duLieu.chiTiet
    || duLieu.ChiTiet
    || donHang?.chiTiet
    || donHang?.ChiTiet
    || []
  const chiTiet = Array.isArray(danhSachChiTiet)
    ? danhSachChiTiet.map(chuanHoaChiTietOrderDangMoTaiBan)
    : []
  const tongTienMon = chiTiet.reduce(
    (tong, mon) => tong + Number(mon.ThanhTien ?? mon.thanhTien ?? 0),
    0,
  )
  const tongHopGia = donHang?.tongHopGia || donHang?.TongHopGia || duLieu.tongHopGia || duLieu.TongHopGia || {}
  const tamTinh = Number(tongHopGia.tamTinh ?? tongHopGia.TamTinh ?? tongTienMon)
  const phiDichVu = Number(tongHopGia.phiDichVu ?? tongHopGia.PhiDichVu ?? 0)
  const tongThanhToan = Number(
    donHang?.tongTien
      ?? donHang?.TongTien
      ?? tongHopGia.tongTien
      ?? tongHopGia.TongTien
      ?? duLieu.tongThanhToan
      ?? duLieu.TongThanhToan
      ?? tamTinh + phiDichVu,
  )

  return {
    ...duLieu,
    donHang,
    chiTiet,
    ChiTiet: chiTiet,
    tongHopGia: {
      ...tongHopGia,
      tamTinh,
      phiDichVu,
      tongTien: tongThanhToan,
    },
    tongTienMon,
    tamTinh,
    phiDichVu,
    tongThanhToan,
  }
}

export const layThucDonTheoBanApi = async (maBan) => {
  if (!coSuDungMayChu()) {
    return tachPhanHoiApi(taoPhanHoiOffline(layThucDonTheoBanOffline(maBan), 'Lay thuc don theo ban thanh cong'))
  }

  return tachPhanHoiApi(await trinhKhachApi.get(`/ban/${maBan}/thuc-don`))
}

export const guiOrderTaiBanApi = async (maBan, danhSachMon) => {
  if (!coSuDungMayChu()) {
    let duLieu = null

    capNhatHeThongOffline((draft) => {
      const ban = draft.ban.find((item) => String(item.code || item.id) === String(maBan || ''))
      if (!ban) {
        throw new Error('Bàn không tồn tại hoặc QR code không hợp lệ')
      }

      const danhSachChiTiet = Array.isArray(danhSachMon) ? danhSachMon.map((item, index) => {
        const mon = draft.thucDon.find((dish) => String(dish.maMon || dish.MaMon) === String(item.maMon || ''))
        const soLuong = Number(item.soLuong || 0)
        const donGia = Number(mon?.gia || mon?.Gia || 0)
        return {
          maChiTiet: item.maChiTiet || `CTBAN_${Date.now()}_${index}`,
          MaChiTiet: item.maChiTiet || `CTBAN_${Date.now()}_${index}`,
          maMon: item.maMon,
          MaMon: item.maMon,
          tenMon: mon?.tenMon || mon?.TenMon || item.maMon,
          TenMon: mon?.tenMon || mon?.TenMon || item.maMon,
          soLuong,
          SoLuong: soLuong,
          donGia,
          DonGia: donGia,
          thanhTien: donGia * soLuong,
          ThanhTien: donGia * soLuong,
        }
      }) : []

      const tongTien = danhSachChiTiet.reduce((sum, item) => sum + Number(item.thanhTien || 0), 0)
      const maDonHang = ban.activeOrderCode || taoMaDonHangMoiOffline()
      const donHang = {
        maDonHang,
        orderCode: maDonHang,
        maKH: '',
        loaiDon: 'TAI_BAN',
        trangThai: 'DANG_CHUAN_BI',
        tongTien,
        ngayTao: new Date().toISOString(),
        customer: { fullName: '', phone: '', email: '', address: '' },
        items: danhSachChiTiet.map((item) => ({
          id: item.maChiTiet,
          maChiTiet: item.maChiTiet,
          maMon: item.maMon,
          tenMon: item.tenMon,
          soLuong: item.soLuong,
          donGia: item.donGia,
          thanhTien: item.thanhTien,
          quantity: item.soLuong,
          price: item.donGia,
          name: item.tenMon,
        })),
        danhSachMon: danhSachChiTiet.map((item) => ({
          tenMon: item.tenMon,
          soLuong: item.soLuong,
          donGia: item.donGia,
          thanhTien: item.thanhTien,
        })),
      }

      draft.donHang = draft.donHang.filter((order) => String(order.maDonHang || '') !== maDonHang)
      draft.donHang.push(donHang)
      ban.activeOrderCode = maDonHang
      ban.status = 'CO_KHACH'
      duLieu = {
        donHang: { maDonHang, tongTien },
        chiTiet: danhSachChiTiet,
      }
    })

    return tachPhanHoiApi(taoPhanHoiOffline(duLieu, 'Gui order thanh cong'))
  }

  return tachPhanHoiApi(await trinhKhachApi.post(`/ban/${maBan}/order`, { danhSachMon }))
}

export const layOrderDangMoTaiBanApi = async (maBan) => {
  if (!coSuDungMayChu()) {
    const order = timOrderDangMoTheoBan(maBan)
    const duLieu = order ? chuanHoaOrderDangMoTaiBan(taoChiTietDonHangTaiBanOffline(order)) : null
    return tachPhanHoiApi(taoPhanHoiOffline(duLieu, 'Lay order dang mo thanh cong'))
  }

  const phanHoi = tachPhanHoiApi(await trinhKhachApi.get(`/ban/${maBan}/order`))
  return {
    ...phanHoi,
    duLieu: chuanHoaOrderDangMoTaiBan(phanHoi.duLieu),
  }
}

export const guiYeuCauThanhToanTaiBanApi = async (maBan) => {
  if (!coSuDungMayChu()) {
    capNhatHeThongOffline((draft) => {
      const ban = draft.ban.find((item) => String(item.code || item.id) === String(maBan || ''))
      if (!ban) {
        throw new Error('Bàn không tồn tại hoặc QR code không hợp lệ')
      }
      ban.status = 'CHO_THANH_TOAN'
    })

    return tachPhanHoiApi(taoPhanHoiOffline(null, 'Da gui yeu cau thanh toan'))
  }

  return tachPhanHoiApi(await trinhKhachApi.post(`/ban/${maBan}/yeu-cau-thanh-toan`, {}))
}

export const xacNhanThanhToanTaiBanApi = async (maBan) => {
  if (!coSuDungMayChu()) {
    capNhatHeThongOffline((draft) => {
      const ban = draft.ban.find((item) => String(item.code || item.id) === String(maBan || ''))
      if (!ban) {
        throw new Error('Bàn không tồn tại hoặc QR code không hợp lệ')
      }

      const donHang = draft.donHang.find((item) => String(item.maDonHang || '') === String(ban.activeOrderCode || ''))
      if (donHang) {
        donHang.trangThai = 'DA_THANH_TOAN'
      }

      ban.status = 'TRONG'
      ban.activeOrderCode = ''
    })

    return tachPhanHoiApi(taoPhanHoiOffline(null, 'Xac nhan thanh toan thanh cong'))
  }

  return tachPhanHoiApi(await trinhKhachApi.post(`/ban/${maBan}/xac-nhan-thanh-toan`, {}))
}
