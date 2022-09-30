<?php

namespace Loqate\Tag\Controller\Adminhtml\Logout;

use Magento\Backend\App\AbstractAction;
use Magento\Backend\App\Action\Context;
use Magento\Framework\HTTP\ZendClientFactory;
use Magento\Framework\Controller\Result\JsonFactory;
use Loqate\Tag\Model\SettingsDataFactory;

class Index extends AbstractAction
{
    /**
     * @var SettingsDataFactory
     */
    protected $settingsDataFactory;

    /**
     * @var ZendClientFactory
     */
    protected $httpClientFactory;

    /**
     * @var JsonFactory
     */
    protected $resultJsonFactory;

    public function __construct(
        Context $context,
        JsonFactory $resultJsonFactory,
        SettingsDataFactory $settingsDataFactory,
        ZendClientFactory $httpClientFactory
    ) {
        $this->settingsDataFactory = $settingsDataFactory;
        $this->httpClientFactory = $httpClientFactory;
        $this->resultJsonFactory = $resultJsonFactory;

        return parent::__construct($context);
    }

    /**
     * @return \Magento\Framework\App\ResponseInterface|
     * \Magento\Framework\Controller\Result\Json|\Magento\Framework\Controller\ResultInterface
     */
    public function execute()
    {

        $result = $this->resultJsonFactory->create();

        try {
            $settings = $this->settingsDataFactory->create();
            $itemCollection = $settings->getCollection();
            $items = $itemCollection->getData();
    
            $lastCreationTime = null;
            $lastItemRow = null;
    
            foreach ($items as $item) {
                if ($lastCreationTime == null || $lastCreationTime < $item['creation_time']) {
                    $lastCreationTime = $item['creation_time'];
                    $lastItemRow = $item;
                }
            }

            $settings->load($lastItemRow['loqate_tag_settingsdata_id']);

            $settings->delete();

            return $result->setData(['success' => true]);
        } catch (\Exception $ex) {
            return $result->setData(['success' => false, 'exception' => $ex->getMessage()]);
        }
    }

    /**
     * @return bool
     */
    protected function _isAllowed()
    {
        return $this->_authorization->isAllowed('Loqate_Tag::Settings');
    }
}
