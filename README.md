Events Modülünün İşlevi
src/events klasöründeki modül bir olay (event) yönetim sistemi sağlıyor. Bu modül, NestJS framework'ü kullanılarak geliştirilmiş ve aşağıdaki temel işlevleri yerine getiriyor:

Temel İşlevler:
Olay Tanımları (Event Definitions) Yönetimi:

Sistemde çeşitli olaylar tanımlanabilir (koleksiyon oluşturma, güncelleme, silme gibi)
Her olay tanımı belirli koşullara bağlı olarak tetiklenebilir
Olaylar aktif veya pasif durumda olabilir
Olay Tetikleyicileri (Event Triggers):

Bir olay gerçekleştiğinde otomatik olarak başka koleksiyonlarda işlemler yapılabilir
Tetikleyiciler create, update veya delete operasyonlarını gerçekleştirebilir
Hedef koleksiyonlarda belirli filtreler ve verilerle işlemler yapılabilir
Webhook Entegrasyonu:

Olaylar gerçekleştiğinde dış sistemlere HTTP webhook'ları aracılığıyla bildirim gönderilebilir
Webhook'lar özel başlıklar ve veri yapıları ile yapılandırılabilir
Olay Kuyruğu (Event Queue) Yönetimi:

Olaylar BullMQ kütüphanesi kullanılarak bir kuyruk sisteminde işlenir
Redis veritabanı kuyruk yönetimi için kullanılır
Başarısız olaylar için yeniden deneme mekanizması bulunur
Olay Günlüğü (Event Log) Tutma:

Tüm olaylar veritabanında kaydedilir
Olayların durumu (beklemede, işleniyor, tamamlandı, başarısız, yeniden deneniyor) takip edilir
Hata mesajları ve işlem zamanları kaydedilir
Mimari Yapı:
Entities (Varlıklar):

EventDefinition: Olay tanımlarını içerir
EventLog: Olay günlüklerini tutar
EventTrigger: Olay tetikleyicilerini tanımlar
Webhook: Webhook yapılandırmalarını içerir
Services (Servisler):

EventsService: Olay tanımları, günlükleri ve tetikleyicileri yönetir
EventQueueService: Olay kuyruğunu ve işleme sürecini yönetir
WebhookService: Webhook'ları oluşturur ve gönderir
Controller:

EventsController: Olay tanımları, tetikleyicileri ve webhook'ları oluşturmak için API endpoint'leri sağlar
Enums (Numaralandırmalar):

EventStatus: Olay durumlarını tanımlar (beklemede, işleniyor, tamamlandı, başarısız, yeniden deneniyor)
EventType: Olay tiplerini tanımlar (koleksiyon oluşturma, güncelleme, silme, alan güncelleme)
Kullanım Senaryoları:
Otomatik İş Akışları: Bir koleksiyonda veri değiştiğinde, başka koleksiyonlarda otomatik olarak işlemler yapılabilir.

Entegrasyon: Sistem içindeki olaylar dış sistemlere webhook'lar aracılığıyla bildirilebilir.

Denetim ve İzleme: Tüm olaylar günlüklenir, böylece sistem aktiviteleri izlenebilir ve sorunlar tespit edilebilir.

Koşullu Tetikleme: Olaylar belirli koşullar sağlandığında tetiklenebilir, bu da esnek iş akışları oluşturmayı sağlar.

Bu modül, sistemde gerçekleşen olayları izlemek, bu olaylara tepki vermek ve dış sistemlerle entegrasyon sağlamak için güçlü bir altyapı sunuyor. Özellikle mikroservis mimarisinde veya karmaşık iş akışlarının olduğu sistemlerde çok faydalı olabilir.
