<?php

namespace Loqate\Tag\Controller\Adminhtml\Settings;

use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\View\Result\PageFactory;
use Magento\Framework\HTTP\ZendClientFactory;
use Loqate\Tag\Model\SettingsDataFactory;

class Index extends Action
{
    /**
     * @var PageFactory
     */
    protected $resultPageFactory;

    /**
     * @var SettingsDataFactory
     */
    protected $settingsDataFactory;

    /**
     * @var ZendClientFactory
     */
    protected $httpClientFactory;

    /**
     * Index constructor.
     *
     * @param Context $context
     * @param PageFactory $resultPageFactory
     * @param SettingsDataFactory $settingsDataFactory
     * @param ZendClientFactory $httpClientFactory
     */
    public function __construct(
        Context $context,
        PageFactory $resultPageFactory,
        SettingsDataFactory $settingsDataFactory,
        ZendClientFactory $httpClientFactory
    ) {
        $this->resultPageFactory = $resultPageFactory;
        $this->settingsDataFactory = $settingsDataFactory;
        $this->httpClientFactory = $httpClientFactory;

        return parent::__construct($context);
    }

    /**
     * @return \Magento\Framework\App\ResponseInterface|\Magento\Framework\Controller\ResultInterface|
     * \Magento\Framework\View\Result\Page
     */
    public function execute()
    {

        if ($this->getRequest()->isAjax()) {
            $action = $this->getRequest()->getParam('action');

            if ($action == 'save') {
                $customjavascriptfront = $this->getRequest()->getParam('custom_javascript_front');
                $customjavascriptback = $this->getRequest()->getParam('custom_javascript_back');

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

                    $settings->setCustomJavascriptFront($customjavascriptfront);
                    $settings->setCustomJavascriptBack($customjavascriptback);

                    $settings->save();
                } catch (\Exception $ex) {
                    $ex->getMessage();
                }
            }
        }

        $page = $this->resultPageFactory->create();
        $page->setActiveMenu('Loqate_Tag::Settings');
        $page->getConfig()->getTitle()->prepend(__('Loqate Settings'));
        return $page;
    }

    /**
     * @return bool
     */
    protected function _isAllowed()
    {
        return $this->_authorization->isAllowed('Loqate_Tag::Settings');
    }
}
