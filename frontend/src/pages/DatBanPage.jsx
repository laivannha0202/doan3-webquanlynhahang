import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Col, ConfigProvider, Row } from 'antd'
import '../theme/dat-ban.css'
import { banKhaDungDat } from '../constants/trangThaiBan'
import { chuanHoaMaKhuVucBan } from '../constants/khuVucBan'
import {
  CAC_CA_KHUNG_GIO_DAT_BAN,
  GIO_GIOI_HAN_NHAN_DAT_BAN,
  KHU_VUC_DAT_BAN_CONG_KHAI,
  NHAN_GOI_Y_KHU_VUC_DAT_BAN,
  NHAN_THU_TRONG_TUAN,
  NHAN_TIN_HIEU_KHA_DUNG_DAT_BAN,
  SO_NGAY_DAT_BAN_HIEN_NHANH,
  SO_NGAY_TOI_DA_NHAN_DAT_BAN,
  SO_PHUT_TOI_THIEU_TRUOC_GIO_DAT_BAN,
  THU_DONG_CUA_DAT_BAN,
} from '../features/datBan/constants/duLieuDatBan'
import { dinhDangNgayGio, layNhanChoNgoi } from '../features/noiBo/dinhDang'
import { useDatBan } from '../features/datBan/hooks/useDatBan'
import { useXacThuc } from '../hooks/useXacThuc'
import { layDanhSachBanApi } from '../services/api/apiBanAn'
import { layKhaDungDatBanApi } from '../services/api/apiDatBan'
import { taoDuLieuBanNhapTamDatBan } from '../features/datBan/utils/banNhapTamDatBan'
import { taiDuLieuBanCongKhai } from '../features/datBan/utils/chinhSachDatBan'
import { SITE_CONTACT } from '../constants/lienHeTrang'
import BuocMotDatBan from '../features/datBan/components/BuocMotDatBan'
import BuocHaiChonMon from '../features/datBan/components/BuocHaiChonMon'
import BuocHaiDatBan from '../features/datBan/components/BuocHaiDatBan'
import BuocBaDatBan from '../features/datBan/components/BuocBaDatBan'
import ThanhBenDatBan from '../features/datBan/components/ThanhBenDatBan'
import DatBanThanhCong from '../features/datBan/components/DatBanThanhCong'

const STEPS = [
  { id: 1, label: 'Chọn chỗ', description: 'Số khách, ngày, giờ và khu vực ưu tiên.' },
  { id: 2, label: 'Chọn món', description: 'Chọn món trước (tuỳ chọn).' },
  { id: 3, label: 'Thông tin liên hệ', description: 'Tên, số điện thoại và ghi chú.' },
  { id: 4, label: 'Xác nhận', description: 'Rà soát toàn bộ thông tin trước khi gửi.' },
]

const DEFAULT_FORM_DATA = {
  guests: '',
  date: '',
  time: '',
  seatingArea: 'KHONG_UU_TIEN',
  occasion: '',
  notes: '',
  name: '',
  phone: '',
  email: '',
}

const REVIEW_NOTICE = [
  'Giữ bàn 15 phút sau giờ hẹn.',
  'Khu vực là ưu tiên, không cam kết 100% đúng vị trí mong muốn.',
  'Nhóm đông hoặc giờ cao điểm có thể cần host gọi lại để chốt nhanh hơn.',
]

const normalizeFieldValue = (value) => String(value ?? '')
const GUEST_PHONE_PATTERN = /^(0[35789])\d{8}$/

const mergeDraftWithUser = (draft, user) => ({
  ...DEFAULT_FORM_DATA,
  ...Object.fromEntries(Object.entries(draft || {}).map(([key, value]) => [key, normalizeFieldValue(value)])),
  name: normalizeFieldValue(draft?.name || user?.fullName || user?.name),
  phone: normalizeFieldValue(draft?.phone || user?.phone),
  email: normalizeFieldValue(draft?.email || user?.email),
})

const taoMaTam = () => `DB_${Date.now()}`

const taoNgayKhongGio = (value) => {
  const [year, month, day] = String(value).split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

const laNgayHomNay = (value) => {
  const today = new Date()
  const candidate = taoNgayKhongGio(value)
  return today.toDateString() === candidate.toDateString()
}

const taoIsoTuNgay = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const congNgay = (date, amount) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + amount)
  return nextDate
}

const taoMocThoiGianTuNgayGio = (date, time) => {
  const [hours, minutes] = String(time).split(':').map(Number)
  const dateWithoutTime = taoNgayKhongGio(date)
  dateWithoutTime.setHours(hours || 0, minutes || 0, 0, 0)
  return dateWithoutTime
}

const layThongTinVoHieuHoaNgay = (date, now = new Date()) => {
  const iso = taoIsoTuNgay(date)
  const dayOfWeek = date.getDay()
  const isClosedDay = THU_DONG_CUA_DAT_BAN.includes(dayOfWeek)
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const isToday = laNgayHomNay(iso)
  const isAfterCutoffToday = isToday && currentTime >= GIO_GIOI_HAN_NHAN_DAT_BAN

  if (isClosedDay) {
    return { isDisabled: true, reason: 'Nhà hàng không mở cửa ngày này', isClosedDay: true }
  }

  if (isAfterCutoffToday) {
    return { isDisabled: true, reason: 'Hôm nay đã qua giờ nhận đặt bàn', isClosedDay: false }
  }

  return { isDisabled: false, reason: '', isClosedDay: false }
}

const taoDanhSachNgayNhanh = () => {
  const today = new Date()

  return Array.from({ length: SO_NGAY_DAT_BAN_HIEN_NHANH }, (_, index) => {
    const date = congNgay(today, index)
    const iso = taoIsoTuNgay(date)
    const dayOfWeek = date.getDay()
    const trangThaiVoHieuHoa = layThongTinVoHieuHoaNgay(date, today)

    return {
      value: iso,
      label: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      dayLabel: NHAN_THU_TRONG_TUAN[dayOfWeek],
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isClosedDay: trangThaiVoHieuHoa.isClosedDay,
      isDisabled: trangThaiVoHieuHoa.isDisabled,
      disabledReason: trangThaiVoHieuHoa.reason,
    }
  })
}

const tinhSoBanTheoKhuVuc = (tables, guests) => {
  const soKhach = Number(guests) || 0

  return KHU_VUC_DAT_BAN_CONG_KHAI.reduce((result, area) => {
    const count = tables.filter((table) => table.areaId === area.value && table.capacity >= soKhach).length
    result[area.value] = count
    return result
  }, {})
}

const chuyenDoiKhuVucTable = (ban) => {
  return chuanHoaMaKhuVucBan(ban.areaId || ban.khuVuc || ban.KhuVuc || ban.viTri || ban.ViTri || '')
}

const tinhAreaAvailabilityTuApi = (danhSachBan, soKhach) => {
  const soKhachNum = Number(soKhach) || 0

  const counts = KHU_VUC_DAT_BAN_CONG_KHAI.reduce((result, area) => {
    const count = danhSachBan.filter((ban) => {
      const areaId = chuyenDoiKhuVucTable(ban)
      const soCho = Number(ban.soChoNgoi || ban.SoChoNgoi || 0)
      return areaId === area.value && soCho >= soKhachNum
    }).length
    result[area.value] = count
    return result
  }, {})

  return Object.fromEntries(Object.entries(counts).map(([area, count]) => [area, tinhTinhTrangKhuVuc(count)]))
}

const tinhTinhTrangKhuVuc = (count) => {
  if (count <= 0) {
    return { count: 0, label: NHAN_TIN_HIEU_KHA_DUNG_DAT_BAN.FULL, tone: 'full' }
  }

  if (count <= 2) {
    return { count, label: NHAN_TIN_HIEU_KHA_DUNG_DAT_BAN.LIMITED, tone: 'limited' }
  }

  return { count, label: NHAN_TIN_HIEU_KHA_DUNG_DAT_BAN.AVAILABLE, tone: 'available' }
}

const tinhTinhTrangKhungGio = ({ date, time, tables = [], bookings = [] }) => {
  const selectedDate = taoNgayKhongGio(date)
  const isToday = laNgayHomNay(date)
  const isClosedDay = THU_DONG_CUA_DAT_BAN.includes(selectedDate.getDay())
  const currentDateTime = new Date()
  const currentTime = `${String(currentDateTime.getHours()).padStart(2, '0')}:${String(currentDateTime.getMinutes()).padStart(2, '0')}`
  const isAfterCutoffToday = isToday && currentTime >= GIO_GIOI_HAN_NHAN_DAT_BAN

  if (isClosedDay || isAfterCutoffToday) {
    return { count: 0, availability: 'FULL', availabilityLabel: NHAN_TIN_HIEU_KHA_DUNG_DAT_BAN.FULL, isDisabled: true }
  }

  if (isToday) {
    const slotDateTime = taoMocThoiGianTuNgayGio(date, time)
    const diffInMinutes = Math.floor((slotDateTime.getTime() - currentDateTime.getTime()) / (1000 * 60))

    if (diffInMinutes < SO_PHUT_TOI_THIEU_TRUOC_GIO_DAT_BAN) {
      return { count: 0, availability: 'FULL', availabilityLabel: 'Đã qua', isDisabled: true }
    }
  }

  const tongBanSanSang = Array.isArray(tables)
    ? tables.filter((table) => banKhaDungDat(table?.status)).length
    : 0

  const soDatBanCungKhungGio = Array.isArray(bookings)
    ? bookings.filter((booking) => booking?.date === date && booking?.time === time && booking?.status !== 'DA_HUY' && booking?.status !== 'KHONG_DEN' && booking?.status !== 'HOAN_THANH' && booking?.status !== 'TU_CHOI_HET_CHO').length
    : 0

  const soBanConLai = Math.max(0, tongBanSanSang - soDatBanCungKhungGio)

  if (soBanConLai <= 0) {
    return { count: 0, availability: 'FULL', availabilityLabel: NHAN_TIN_HIEU_KHA_DUNG_DAT_BAN.FULL, isDisabled: true }
  }

  if (soBanConLai <= 2) {
    return { count: soBanConLai, availability: 'LIMITED', availabilityLabel: NHAN_TIN_HIEU_KHA_DUNG_DAT_BAN.LIMITED, isDisabled: false }
  }

  return {
    count: soBanConLai,
    availability: 'AVAILABLE',
    availabilityLabel: NHAN_TIN_HIEU_KHA_DUNG_DAT_BAN.AVAILABLE,
    isDisabled: false,
  }
}

const tinhYeuCauCoc = ({ guests, seatingArea, selectedMenuItems, subtotal }) => {
  const soTienCocToiThieu = 500000
  const tiLeCoc = 0.2

  const yeuCauCoc = Boolean(
    Number(guests) >= 5 ||
    seatingArea === 'PHONG_VIP' ||
    (Array.isArray(selectedMenuItems) && selectedMenuItems.length > 0)
  )

  if (!yeuCauCoc) {
    return { isYeuCauCoc: false, soTienCoc: 0, liDo: [] }
  }

  const liDo = []
  if (Number(guests) >= 5) liDo.push('Nhóm từ 5 người trở lên')
  if (seatingArea === 'PHONG_VIP') liDo.push('Khu riêng')
  if (Array.isArray(selectedMenuItems) && selectedMenuItems.length > 0) liDo.push('Đặt món trước')

  let soTienCoc = soTienCocToiThieu
  if (subtotal > 0) {
    soTienCoc = Math.max(soTienCoc, Math.round(subtotal * tiLeCoc))
  }

  return { isYeuCauCoc: true, soTienCoc, liDo }
}

const tinhTongTienMenu = (selectedMenuItems) => {
  return selectedMenuItems.reduce((tong, item) => {
    const giaTri = Number(String(item.price).replace(/\D/g, '')) || 0
    return tong + giaTri * (item.quantity || 1)
  }, 0)
}

const mapAreaLabel = (seatingArea) => {
  const found = KHU_VUC_DAT_BAN_CONG_KHAI.find((area) => area.value === seatingArea)
  if (found) return found.label
  return layNhanChoNgoi(seatingArea)
}

function DatBanPage() {
  const { nguoiDungHienTai, coTheVaoNoiBo, daDangNhap, dangKhoiTaoXacThuc } = useXacThuc()
  const { layBanNhapTam, luuBanNhapTam, xoaBanNhapTam, layBanPhuHopChoDatBan, taoDatBan, layDanhSachDatBanHost } = useDatBan()
  const location = useLocation()
  const navigate = useNavigate()
  const rebookData = location.state?.rebook

  const [tables, setTables] = useState([])
  const [danhSachDatBanHienTai, setDanhSachDatBanHienTai] = useState([])
  const [duLieuKhaDungDatBan, setDuLieuKhaDungDatBan] = useState(null)
  const [isLoadingTables, setIsLoadingTables] = useState(true)
  const [dangTaiKhaDung, setDangTaiKhaDung] = useState(false)
  const [loiTaiBan, setLoiTaiBan] = useState('')
  const [didBootstrapDraft, setDidBootstrapDraft] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [stepErrors, setStepErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedMenuItems, setSelectedMenuItems] = useState([])
  const [formData, setFormData] = useState(() => mergeDraftWithUser(layBanNhapTam(), nguoiDungHienTai))

  useEffect(() => {
    const draft = layBanNhapTam()
    const nextFormData = mergeDraftWithUser(draft, nguoiDungHienTai)
    setFormData(nextFormData)
    setDidBootstrapDraft(true)
  }, [layBanNhapTam, nguoiDungHienTai])

  useEffect(() => {
    if (!rebookData) return
    const rebookForm = {
      guests: rebookData.guests || '',
      date: rebookData.date || '',
      time: rebookData.time || '',
      seatingArea: rebookData.seatingArea || 'KHONG_UU_TIEN',
      occasion: rebookData.occasion || '',
      notes: rebookData.notes || '',
      name: rebookData.name || '',
      phone: rebookData.phone || '',
      email: rebookData.email || '',
    }
    setFormData(rebookForm)
    xoaBanNhapTam()
    navigate('.', { replace: true })
  }, [rebookData, navigate, xoaBanNhapTam])

  useEffect(() => {
    let active = true

    const loadTables = async () => {
      setIsLoadingTables(true)
      setLoiTaiBan('')

      try {
        const { duLieuBan, danhSachDatBan } = await taiDuLieuBanCongKhai({
          coTheVaoNoiBo,
          layDanhSachBanApi,
          layDanhSachDatBanHost,
        })

        if (!active) return

        setTables(duLieuBan)
        setDanhSachDatBanHienTai(danhSachDatBan)
      } catch (error) {
        if (!active) return
        setTables([])
        setDanhSachDatBanHienTai([])
        setLoiTaiBan(error?.message || 'Không thể tải dữ liệu bàn khả dụng từ máy chủ.')
      } finally {
        if (active) {
          setIsLoadingTables(false)
        }
      }
    }

    loadTables()
    return () => {
      active = false
    }
  }, [coTheVaoNoiBo, layDanhSachDatBanHost])

  useEffect(() => {
    if (!didBootstrapDraft || submitSuccess) {
      return
    }

    luuBanNhapTam(taoDuLieuBanNhapTamDatBan(formData))
  }, [didBootstrapDraft, formData, luuBanNhapTam, submitSuccess])

  useEffect(() => {
    let active = true

    const taiKhaDungDatBan = async () => {
      if (!formData.date || !formData.time) {
        setDuLieuKhaDungDatBan(null)
        return
      }

      try {
        setDangTaiKhaDung(true)
        const phanHoi = await layKhaDungDatBanApi({
          ngayDat: formData.date,
          gioDat: formData.time,
          soNguoi: Number(formData.guests) || 0,
          khuVuc: formData.seatingArea,
        })

        if (!active) return
        setDuLieuKhaDungDatBan(phanHoi?.duLieu || null)
      } catch {
        if (!active) return
        setDuLieuKhaDungDatBan(null)
      } finally {
        if (active) {
          setDangTaiKhaDung(false)
        }
      }
    }

    taiKhaDungDatBan()

    return () => {
      active = false
    }
  }, [formData.date, formData.guests, formData.seatingArea, formData.time])

  const dateOptions = useMemo(() => taoDanhSachNgayNhanh(), [])
  const dateOptionMap = useMemo(() => new Map(dateOptions.map((item) => [item.value, item])), [dateOptions])
  const maxDateIso = useMemo(() => taoIsoTuNgay(congNgay(new Date(), SO_NGAY_TOI_DA_NHAN_DAT_BAN)), [])

  const bookingDraft = useMemo(() => ({
    id: 'public-selection-preview',
    guests: formData.guests,
    date: formData.date,
    time: formData.time,
    seatingArea: formData.seatingArea,
  }), [formData.date, formData.guests, formData.seatingArea, formData.time])

  const candidateTables = useMemo(() => (
    formData.guests ? layBanPhuHopChoDatBan(bookingDraft, tables, { filterByArea: true }) : []
  ), [bookingDraft, formData.guests, layBanPhuHopChoDatBan, tables])

  const allTablesForArea = useMemo(() => (
    formData.guests ? layBanPhuHopChoDatBan(bookingDraft, tables, { filterByArea: false }) : []
  ), [bookingDraft, formData.guests, layBanPhuHopChoDatBan, tables])

  const areaAvailability = useMemo(() => {
    const coDuLieuApi = duLieuKhaDungDatBan &&
      duLieuKhaDungDatBan.ngayDat === formData.date &&
      duLieuKhaDungDatBan.gioDat === formData.time

    if (coDuLieuApi && duLieuKhaDungDatBan.danhSachBan) {
      return tinhAreaAvailabilityTuApi(duLieuKhaDungDatBan.danhSachBan, formData.guests)
    }

    const counts = tinhSoBanTheoKhuVuc(allTablesForArea, formData.guests)
    return Object.fromEntries(Object.entries(counts).map(([area, count]) => [area, tinhTinhTrangKhuVuc(count)]))
  }, [allTablesForArea, duLieuKhaDungDatBan, formData.date, formData.guests, formData.time])

  const areaOptions = useMemo(() => {
    const soKhach = Number(formData.guests) || 0

    return KHU_VUC_DAT_BAN_CONG_KHAI.map((area) => {
      if (area.value !== 'PHONG_VIP') {
        return area
      }

      if (soKhach >= 7 && soKhach <= 10) {
        return {
          ...area,
          recommendationBadge: NHAN_GOI_Y_KHU_VUC_DAT_BAN.PHONG_VIP_KHUYEN_NGHI,
          recommendationNote: '',
        }
      }

      if (soKhach >= 3 && soKhach <= 6) {
        return {
          ...area,
          recommendationBadge: '',
          recommendationNote: NHAN_GOI_Y_KHU_VUC_DAT_BAN.PHONG_VIP_NHOM_NHO,
        }
      }

      return {
        ...area,
        recommendationBadge: '',
        recommendationNote: '',
      }
    })
  }, [formData.guests])

  const timeSlotOptions = useMemo(() => {
    if (!formData.date) {
      return []
    }

    return CAC_CA_KHUNG_GIO_DAT_BAN.flatMap((period) => period.slots.map((time) => {
      const duLieuApi = formData.date === duLieuKhaDungDatBan?.ngayDat && time === duLieuKhaDungDatBan?.gioDat
        ? duLieuKhaDungDatBan
        : null

      if (duLieuApi) {
        return {
          time,
          periodId: period.id,
          count: Number(duLieuApi.tongBanPhuHop || 0),
          availability: duLieuApi.mucKhaDung || 'FULL',
          availabilityLabel: NHAN_TIN_HIEU_KHA_DUNG_DAT_BAN[duLieuApi.mucKhaDung] || NHAN_TIN_HIEU_KHA_DUNG_DAT_BAN.FULL,
          isDisabled: Number(duLieuApi.tongBanPhuHop || 0) <= 0,
        }
      }

      return {
        time,
        periodId: period.id,
        ...tinhTinhTrangKhungGio({
          date: formData.date,
          time,
          tables,
          bookings: danhSachDatBanHienTai,
        }),
      }
    }))
  }, [danhSachDatBanHienTai, duLieuKhaDungDatBan, formData.date, tables])

  const summaryAreaLabel = mapAreaLabel(formData.seatingArea)
  const todayIso = taoIsoTuNgay(new Date())
  const selectedDateOption = dateOptionMap.get(formData.date)
  const selectedDateLabel = selectedDateOption?.label || (formData.date ? dinhDangNgayGio(formData.date, '').trim() : 'Chưa chọn')
  const selectedDayLabel = selectedDateOption?.dayLabel || ''
  const selectedAreaAvailability = formData.seatingArea && formData.seatingArea !== 'KHONG_UU_TIEN'
    ? areaAvailability[formData.seatingArea]
    : null
  const selectedAreaUnavailable = Boolean(selectedAreaAvailability && selectedAreaAvailability.count <= 0)
  const otherAreasHaveTables = Boolean(
    formData.seatingArea && formData.seatingArea !== 'KHONG_UU_TIEN' &&
    Object.entries(areaAvailability).some(([area, info]) => area !== formData.seatingArea && info.count > 0)
  )
  const selectedAreaUnavailableMessage = selectedAreaUnavailable
    ? otherAreasHaveTables
      ? 'Khu vực ưu tiên không có bàn phù hợp với số khách. Vui lòng chọn khu vực khác hoặc bỏ ưu tiên khu vực.'
      : 'Khu vực này đã hết chỗ, vui lòng chọn khu vực khác hoặc bỏ chọn khu vực.'
    : ''
  const largePartyNotice = Number(formData.guests) >= 10 ? `Hotline ${SITE_CONTACT.phoneDisplay}` : ''
  const thongBaoTaiBan = loiTaiBan || (isLoadingTables ? 'Đang tải dữ liệu bàn khả dụng từ máy chủ...' : '') || (dangTaiKhaDung ? 'Đang cập nhật khả dụng đặt bàn...' : '')

  const summary = useMemo(() => {
    const subtotal = tinhTongTienMenu(selectedMenuItems)
    return {
      guests: Number(formData.guests) > 0 ? `${Number(formData.guests)} người` : 'Chưa chọn',
      date: formData.date ? selectedDateLabel : 'Chưa chọn',
      time: formData.time || 'Chưa chọn',
      area: summaryAreaLabel,
      selectedMenuItems,
      subtotal,
      subtotalLabel: subtotal > 0 ? new Intl.NumberFormat('vi-VN').format(subtotal) + 'đ' : null,
    }
  }, [formData.date, formData.guests, formData.time, selectedDateLabel, summaryAreaLabel, selectedMenuItems])

  const contactSummary = useMemo(() => ({
    name: formData.name || 'Chưa nhập',
    phone: formData.phone || 'Chưa nhập',
    email: formData.email || 'Không có',
    notes: formData.notes || 'Không có',
  }), [formData.email, formData.name, formData.notes, formData.phone])

  const nextStage = !formData.guests ? 'guests' : !formData.date ? 'date' : !formData.time ? 'time' : 'ready'
  const canProceedStepOne = Boolean(Number(formData.guests) > 0 && Number(formData.guests) < 10 && formData.date && formData.time && !selectedAreaUnavailable)

  const validateStepOne = () => {
    if (!Number(formData.guests)) return 'Vui lòng chọn số khách.'
    if (Number(formData.guests) >= 10) return 'Nhóm lớn vui lòng gọi hotline để được hỗ trợ nhanh hơn.'
    if (!formData.date) return 'Vui lòng chọn ngày dùng bữa.'

    const selectedDate = taoNgayKhongGio(formData.date)
    const todayDate = taoNgayKhongGio(todayIso)
    const maxDate = taoNgayKhongGio(maxDateIso)

    if (selectedDate < todayDate) return 'Không thể đặt bàn cho ngày đã qua.'
    if (selectedDate > maxDate) return 'Chỉ nhận đặt bàn trong vòng 30 ngày tới.'
    if (THU_DONG_CUA_DAT_BAN.includes(selectedDate.getDay())) return 'Nhà hàng không mở cửa ngày này.'
    if (!formData.time) return 'Vui lòng chọn khung giờ.'

    const currentDateTime = new Date()
    const currentTime = `${String(currentDateTime.getHours()).padStart(2, '0')}:${String(currentDateTime.getMinutes()).padStart(2, '0')}`
    if (laNgayHomNay(formData.date) && currentTime >= GIO_GIOI_HAN_NHAN_DAT_BAN) {
      return 'Đã qua giờ nhận đặt bàn trong ngày hôm nay.'
    }

    if (laNgayHomNay(formData.date)) {
      const slotDateTime = taoMocThoiGianTuNgayGio(formData.date, formData.time)
      const diffInMinutes = Math.floor((slotDateTime.getTime() - currentDateTime.getTime()) / (1000 * 60))
      if (diffInMinutes < SO_PHUT_TOI_THIEU_TRUOC_GIO_DAT_BAN) {
        return 'Khung giờ này đã qua hoặc quá gần giờ hiện tại. Vui lòng chọn khung giờ khác.'
      }
    }

    if (selectedAreaUnavailable) {
      return selectedAreaUnavailableMessage
    }

    return ''
  }

  const validateContactFields = useCallback((nextFormData = formData) => {
    const errors = {}

    if (nextFormData.name.trim().length < 2) {
      errors.name = 'Tên phải có ít nhất 2 ký tự.'
    }

    const normalizedPhone = nextFormData.phone.replace(/\s+/g, '')
    if (!GUEST_PHONE_PATTERN.test(normalizedPhone)) {
      errors.phone = 'Số điện thoại chưa đúng định dạng Việt Nam.'
    }

    if (nextFormData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextFormData.email.trim())) {
      errors.email = 'Email chưa đúng định dạng.'
    }

    if (nextFormData.notes.length > 200) {
      errors.notes = 'Ghi chú chỉ được tối đa 200 ký tự.'
    }

    return errors
  }, [formData])

  const validateContactField = (field, nextFormData = formData) => {
    const errors = validateContactFields(nextFormData)
    return errors[field] || ''
  }

  const capNhatLoiField = (field, message) => {
    setStepErrors((current) => {
      if (!message) {
        if (!current[field]) {
          return current
        }

        const nextErrors = { ...current }
        delete nextErrors[field]
        return nextErrors
      }

      return {
        ...current,
        [field]: message,
      }
    })
  }

  const coThongTinLienHeHopLe = useMemo(() => {
    const contactErrors = validateContactFields(formData)
    return !contactErrors.name && !contactErrors.phone
  }, [formData, validateContactFields])

  const canProceedStepTwo = true
  const canProceedStepThree = canProceedStepOne && coThongTinLienHeHopLe

  const handleFormFieldChange = (field) => (event) => {
    const nextValue = event.target.value
    const sanitizedValue = field === 'notes' ? nextValue.slice(0, 200) : nextValue

    setSubmitError('')
    setFormData((current) => ({
      ...current,
      [field]: sanitizedValue,
    }))
  }

  const handleSuggestionClick = (suggestion) => {
    const currentNotes = formData.notes.trim()
    const daCoSan = currentNotes.split(',').map((s) => s.trim()).includes(suggestion)

    let nextNotes
    if (daCoSan) {
      nextNotes = currentNotes
    } else {
      nextNotes = currentNotes ? `${currentNotes}, ${suggestion}` : suggestion
    }

    const nextFormData = {
      ...formData,
      notes: nextNotes.slice(0, 200),
    }

    capNhatLoiField('notes', validateContactField('notes', nextFormData))
    setFormData(nextFormData)
  }

  const handleFieldBlur = (field) => () => {
    capNhatLoiField(field, validateContactField(field, formData))
  }

  const handleGuestSelect = (guests) => {
    setSubmitError('')
    setFormData((current) => ({ ...current, guests }))
  }

  const handleDateSelect = (date) => {
    setSubmitError('')
    setFormData((current) => ({ ...current, date, time: current.time }))
  }

  const handleDateInputChange = (event) => {
    setSubmitError('')
    setFormData((current) => ({ ...current, date: event.target.value, time: current.time }))
  }

  const handleTimeSelect = (time) => {
    setSubmitError('')
    setFormData((current) => ({ ...current, time }))
  }

  const handleAreaToggle = (area) => {
    setSubmitError('')
    setFormData((current) => ({
      ...current,
      seatingArea: current.seatingArea === area ? 'KHONG_UU_TIEN' : area,
    }))
  }

  const handleToggleMenuItem = (mon) => {
    setSelectedMenuItems((current) => {
      const existing = current.find((item) => item.id === mon.id)
      if (existing) {
        return current.filter((item) => item.id !== mon.id)
      }
      return [...current, { ...mon, quantity: 1 }]
    })
  }

  const handleRemoveMenuItem = (monId) => {
    setSelectedMenuItems((current) => current.filter((item) => item.id !== monId))
  }

  const handleClearMenuItems = () => {
    setSelectedMenuItems([])
  }

  const handleContinue = () => {
    if (currentStep === 1) {
      const error = validateStepOne()
      if (error) {
        setSubmitError(error)
        return
      }
      setSubmitError('')
      setCurrentStep(2)
      return
    }

    if (currentStep === 2) {
      setCurrentStep(3)
      return
    }

    if (currentStep === 3) {
      const errors = validateContactFields()
      setStepErrors(errors)
      if (Object.keys(errors).length > 0) {
        setSubmitError('Vui lòng kiểm tra lại thông tin liên hệ trước khi tiếp tục.')
        return
      }
      setSubmitError('')
      setCurrentStep(4)
    }
  }

  const handleBackFromReview = () => {
    setSubmitError('')
    setCurrentStep(3)
  }

  const handleBackToStep2 = () => {
    setSubmitError('')
    setCurrentStep(2)
  }

  const handleBackToStep1 = () => {
    setSubmitError('')
    setCurrentStep(1)
  }

  const handleSkipToStep3 = () => {
    setSubmitError('')
    setCurrentStep(3)
  }

const handleSubmit = async () => {
    const stepOneError = validateStepOne()
    if (stepOneError) {
      setCurrentStep(1)
      setSubmitError(stepOneError)
      return
    }

    const contactErrors = validateContactFields()
    setStepErrors(contactErrors)
    if (Object.keys(contactErrors).length > 0) {
      setCurrentStep(3)
      setSubmitError('Vui lòng hoàn thiện thông tin liên hệ trước khi xác nhận.')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const confirmationPayload = {
        bookingCode: taoMaTam(),
        status: 'CHO_XAC_NHAN',
        bookingId: undefined,
      }

      const maBanDuocChon = candidateTables?.[0]?.code || candidateTables?.[0]?.id || null

      if (!maBanDuocChon) {
        throw new Error('Hiện không tìm thấy bàn phù hợp để giữ chỗ cho lựa chọn này. Vui lòng đổi giờ hoặc khu vực.')
      }

      const createdBooking = await taoDatBan({
        booking: {
          ...formData,
          maDatBan: confirmationPayload.bookingCode,
          maKH: nguoiDungHienTai?.maKH || '',
          maBan: maBanDuocChon,
          maNV: '',
          ngayDat: formData.date,
          gioDat: formData.time,
          gioKetThuc: null,
          soNguoi: Number(formData.guests) || 0,
          khuVucUuTien: formData.seatingArea,
          chiTietMonAn: selectedMenuItems,
          notes: [
            formData.notes.trim(),
            formData.seatingArea !== 'KHONG_UU_TIEN' ? `Ưu tiên khu vực: ${mapAreaLabel(formData.seatingArea)}` : '',
          ].filter(Boolean).join(' · '),
        },
        confirmationPayload,
      })

      const depositInfo = tinhYeuCauCoc({
        guests: formData.guests,
        seatingArea: formData.seatingArea,
        selectedMenuItems,
        subtotal: tinhTongTienMenu(selectedMenuItems),
      })

      setSubmitSuccess({
        bookingCode: createdBooking?.bookingCode,
        dateTimeLabel: dinhDangNgayGio(formData.date, formData.time),
        guests: Number(formData.guests) || 0,
        areaLabel: mapAreaLabel(formData.seatingArea),
        phone: formData.phone,
        email: formData.email || SITE_CONTACT.emailDisplay,
        selectedMenuItems,
        subtotal: tinhTongTienMenu(selectedMenuItems),
        depositInfo,
      })
      xoaBanNhapTam()
    } catch (error) {
      setSubmitError(error?.message || 'Không thể gửi yêu cầu đặt bàn lúc này. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (dangKhoiTaoXacThuc) {
    return null
  }

  if (!daDangNhap) {
    return <Navigate to="/dang-nhap" replace state={{ from: '/dat-ban' }} />
  }

  if (submitSuccess) {
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#e8664a',
            colorLink: '#e8664a',
            colorInfo: '#e8664a',
            colorBorder: '#ead7c5',
            borderRadius: 0,
            controlOutline: 'rgba(232, 102, 74, 0.18)',
            colorPrimaryHover: '#d95b41',
            colorPrimaryActive: '#c94d34',
          },
        }}
      >
        <div className="dat-ban-page-customer">
          <section className="dat-ban-customer-section dat-ban-customer-section-tight">
            <div className="container dat-ban-success-layout">
              <DatBanThanhCong confirmation={submitSuccess} />
            </div>
          </section>
        </div>
      </ConfigProvider>
    )
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#e8664a',
          colorLink: '#e8664a',
          colorInfo: '#e8664a',
          colorBorder: '#ead7c5',
          borderRadius: 0,
          controlOutline: 'rgba(232, 102, 74, 0.18)',
          colorPrimaryHover: '#d95b41',
          colorPrimaryActive: '#c94d34',
        },
      }}
    >
      <div className="dat-ban-page-customer">
        <section className="dat-ban-customer-section dat-ban-customer-section-tight">
          <div className="container">
            <Row gutter={[24, 24]} align="start">
              <Col xs={24} xl={currentStep === 4 ? 24 : 16}>
              {currentStep === 1 ? (
                <BuocMotDatBan
                  formData={formData}
                  dateOptions={dateOptions}
                  selectedDateLabel={selectedDateLabel}
                  selectedDayLabel={selectedDayLabel}
                  minDate={todayIso}
                  maxDate={maxDateIso}
                  availabilityByArea={areaAvailability}
                  areaOptions={areaOptions}
                  timeSlotOptions={timeSlotOptions}
                  selectedAreaUnavailableMessage={selectedAreaUnavailableMessage}
                  largePartyNotice={largePartyNotice}
                  thongBaoTaiBan={thongBaoTaiBan}
                  daCoBanPhuHop={candidateTables.length > 0}
                  onGuestSelect={handleGuestSelect}
                  onDateSelect={handleDateSelect}
                  onDateInputChange={handleDateInputChange}
                  onTimeSelect={handleTimeSelect}
                  onAreaToggle={handleAreaToggle}
                />
              ) : null}

              {currentStep === 2 ? (
                <BuocHaiChonMon
                  selectedMenuItems={selectedMenuItems}
                  onToggleItem={handleToggleMenuItem}
                  onClearAll={handleClearMenuItems}
                />
              ) : null}

              {currentStep === 3 ? (
                <BuocHaiDatBan
                  formData={formData}
                  fieldErrors={stepErrors}
                  onFieldChange={handleFormFieldChange}
                  onFieldBlur={handleFieldBlur}
                  onSuggestionClick={handleSuggestionClick}
                />
              ) : null}

              {currentStep === 4 ? (
                <BuocBaDatBan
                  summary={summary}
                  contactSummary={contactSummary}
                  reviewNotice={REVIEW_NOTICE}
                  submitError={submitError}
                  isSubmitting={isSubmitting}
                  yeuCauCoc={tinhYeuCauCoc({
                    guests: formData.guests,
                    seatingArea: formData.seatingArea,
                    selectedMenuItems,
                    subtotal: summary.subtotal,
                  })}
                  onBack={handleBackFromReview}
                  onSubmit={handleSubmit}
                />
              ) : null}

              </Col>

              {currentStep !== 4 && (
              <Col xs={24} xl={8}>
<ThanhBenDatBan
                  steps={STEPS}
                  currentStep={currentStep}
                  summary={summary}
                  nextStage={nextStage}
                  canProceed={
                    currentStep === 1 ? canProceedStepOne :
                    currentStep === 2 ? canProceedStepTwo :
                    currentStep === 3 ? canProceedStepThree :
                    false
                  }
                  continueBlockedMessage={currentStep === 1 ? selectedAreaUnavailableMessage : ''}
                  onContinue={handleContinue}
                  onBack={handleBackToStep2}
                  onBackToStep1={handleBackToStep1}
                  onSkip={handleSkipToStep3}
                  onRemoveItem={handleRemoveMenuItem}
                  onClearCart={handleClearMenuItems}
                />
              </Col>
              )}
            </Row>
          </div>
        </section>
      </div>
    </ConfigProvider>
  )
}

export default DatBanPage
